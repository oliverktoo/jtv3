/**
 * Fixture Locking & Transaction Management
 * Prevents modifications to fixtures after tournament starts
 * Provides rollback capability for failed operations
 */

// ============================================================================
// FIXTURE LOCKING
// ============================================================================

/**
 * Check if tournament fixtures are locked (tournament has started)
 * @param {object} supabase - Supabase client
 * @param {string} tournamentId - Tournament UUID
 * @returns {Promise<{locked: boolean, reason: string}>}
 */
export async function checkFixtureLock(supabase, tournamentId) {
  try {
    // Get tournament details
    const { data: tournament, error } = await supabase
      .from('tournaments')
      .select('status, start_date, name')
      .eq('id', tournamentId)
      .single();

    if (error) throw error;
    if (!tournament) {
      return { locked: false, reason: 'Tournament not found' };
    }

    // Check if tournament has started
    const now = new Date();
    const startDate = new Date(tournament.start_date);
    const hasStarted = now >= startDate;

    // Check if tournament is active or completed
    const isActiveOrCompleted = ['ACTIVE', 'COMPLETED'].includes(tournament.status);

    if (hasStarted || isActiveOrCompleted) {
      return {
        locked: true,
        reason: `Tournament "${tournament.name}" has already started. Fixtures cannot be modified.`,
        status: tournament.status,
        startDate: tournament.start_date
      };
    }

    // Check if any matches have been played
    const { data: matches, error: matchError } = await supabase
      .from('matches')
      .select('id, status')
      .eq('round_id', supabase.rpc('get_tournament_rounds', { tournament_id: tournamentId }))
      .in('status', ['LIVE', 'COMPLETED'])
      .limit(1);

    if (matchError) {
      console.warn('Error checking match status:', matchError);
    }

    if (matches && matches.length > 0) {
      return {
        locked: true,
        reason: `Some matches have already been played. Fixtures cannot be regenerated.`,
        playedMatches: matches.length
      };
    }

    return {
      locked: false,
      reason: null
    };

  } catch (error) {
    console.error('Error checking fixture lock:', error);
    return {
      locked: false,
      reason: 'Error checking lock status',
      error: error.message
    };
  }
}

/**
 * Check if a specific match can be modified
 * @param {object} supabase - Supabase client
 * @param {string} matchId - Match UUID
 * @returns {Promise<{canModify: boolean, reason: string}>}
 */
export async function checkMatchModifiable(supabase, matchId) {
  try {
    const { data: match, error } = await supabase
      .from('matches')
      .select('status, kickoff_time')
      .eq('id', matchId)
      .single();

    if (error) throw error;
    if (!match) {
      return { canModify: false, reason: 'Match not found' };
    }

    // Cannot modify completed matches
    if (match.status === 'COMPLETED') {
      return {
        canModify: false,
        reason: 'Cannot modify a completed match'
      };
    }

    // Cannot modify live matches (except score updates)
    if (match.status === 'LIVE' || match.status === 'HALFTIME') {
      return {
        canModify: false,
        reason: 'Cannot modify match details while match is live. Use score update endpoint instead.',
        allowScoreUpdate: true
      };
    }

    return {
      canModify: true,
      reason: null
    };

  } catch (error) {
    console.error('Error checking match modifiable:', error);
    return {
      canModify: false,
      reason: 'Error checking match status',
      error: error.message
    };
  }
}

// ============================================================================
// TRANSACTION HELPER (Rollback Support)
// ============================================================================

/**
 * Execute a series of database operations with rollback capability
 * Supabase doesn't support transactions directly, so we track operations
 * and manually roll them back if any operation fails
 * 
 * @param {object} supabase - Supabase client
 * @param {Array<Function>} operations - Array of async functions to execute
 * @returns {Promise<{success: boolean, results: Array, error: any}>}
 */
export async function executeWithRollback(supabase, operations) {
  const executedOperations = [];
  const results = [];

  try {
    // Execute each operation and track it
    for (const [index, operation] of operations.entries()) {
      const result = await operation();
      
      results.push(result);
      executedOperations.push({
        index,
        operation,
        result,
        rollback: operation.rollback
      });

      // Check if operation failed
      if (result.error) {
        throw new Error(`Operation ${index} failed: ${result.error.message}`);
      }
    }

    return {
      success: true,
      results,
      error: null
    };

  } catch (error) {
    console.error('Transaction failed, rolling back...', error);

    // Rollback in reverse order
    for (const executed of executedOperations.reverse()) {
      if (executed.rollback) {
        try {
          await executed.rollback(executed.result);
          console.log(`Rolled back operation ${executed.index}`);
        } catch (rollbackError) {
          console.error(`Failed to rollback operation ${executed.index}:`, rollbackError);
        }
      }
    }

    return {
      success: false,
      results: [],
      error: error.message
    };
  }
}

/**
 * Create a bulk insert operation with rollback
 * @param {object} supabase - Supabase client
 * @param {string} table - Table name
 * @param {Array} records - Records to insert
 * @returns {Function} Operation function with rollback
 */
export function createBulkInsertOperation(supabase, table, records) {
  const operation = async () => {
    const { data, error } = await supabase
      .from(table)
      .insert(records)
      .select();

    return { data, error, insertedIds: data?.map(r => r.id) || [] };
  };

  // Rollback function: delete all inserted records
  operation.rollback = async (result) => {
    if (result.insertedIds && result.insertedIds.length > 0) {
      await supabase
        .from(table)
        .delete()
        .in('id', result.insertedIds);
    }
  };

  return operation;
}

/**
 * Create an update operation with rollback
 * @param {object} supabase - Supabase client
 * @param {string} table - Table name
 * @param {string} id - Record ID to update
 * @param {object} updates - Fields to update
 * @returns {Function} Operation function with rollback
 */
export function createUpdateOperation(supabase, table, id, updates) {
  let originalData = null;

  const operation = async () => {
    // Get original data first
    const { data: original } = await supabase
      .from(table)
      .select('*')
      .eq('id', id)
      .single();

    originalData = original;

    // Perform update
    const { data, error } = await supabase
      .from(table)
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    return { data, error };
  };

  // Rollback function: restore original data
  operation.rollback = async () => {
    if (originalData) {
      await supabase
        .from(table)
        .update(originalData)
        .eq('id', id);
    }
  };

  return operation;
}

/**
 * Create a delete operation with rollback
 * @param {object} supabase - Supabase client
 * @param {string} table - Table name
 * @param {string} id - Record ID to delete
 * @returns {Function} Operation function with rollback
 */
export function createDeleteOperation(supabase, table, id) {
  let deletedData = null;

  const operation = async () => {
    // Get data before deleting
    const { data: original } = await supabase
      .from(table)
      .select('*')
      .eq('id', id)
      .single();

    deletedData = original;

    // Perform delete
    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', id);

    return { data: deletedData, error };
  };

  // Rollback function: reinsert deleted data
  operation.rollback = async () => {
    if (deletedData) {
      await supabase
        .from(table)
        .insert(deletedData);
    }
  };

  return operation;
}

// ============================================================================
// BATCH OPERATION WRAPPER
// ============================================================================

/**
 * Execute multiple operations in batches with progress tracking
 * Useful for large fixture generation operations
 * 
 * @param {Array<Function>} operations - Operations to execute
 * @param {number} batchSize - Number of operations per batch
 * @param {Function} onProgress - Progress callback (current, total)
 * @returns {Promise<{success: boolean, results: Array}>}
 */
export async function executeBatchOperations(operations, batchSize = 10, onProgress = null) {
  const results = [];
  const total = operations.length;

  for (let i = 0; i < operations.length; i += batchSize) {
    const batch = operations.slice(i, i + batchSize);
    
    try {
      const batchResults = await Promise.all(batch.map(op => op()));
      results.push(...batchResults);

      if (onProgress) {
        onProgress(Math.min(i + batchSize, total), total);
      }
    } catch (error) {
      console.error(`Batch ${i / batchSize + 1} failed:`, error);
      return {
        success: false,
        results,
        error: error.message,
        completedOperations: i
      };
    }
  }

  return {
    success: true,
    results,
    error: null
  };
}
