import QRCode from 'qrcode';
import { PlayerRegistry } from '../../../shared/schema';

export interface PlayerCardData {
  playerId: string;
  upid: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  nationalId: string;
  orgId: string;
  registrationStatus: string;
  issuedAt: string;
  validUntil: string;
}

export interface QRCodeOptions {
  width?: number;
  height?: number;
  color?: {
    dark?: string;
    light?: string;
  };
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
}

// Generate a secure QR code for a player
export async function generatePlayerQRCode(
  playerData: PlayerCardData,
  options: QRCodeOptions = {}
): Promise<string> {
  try {
    const defaultOptions: QRCodeOptions = {
      width: 200,
      errorCorrectionLevel: 'M',
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      ...options
    };

    // Create a secure payload with essential player info
    const qrPayload = {
      v: '1', // Version
      pid: playerData.playerId,
      upid: playerData.upid,
      name: `${playerData.firstName} ${playerData.lastName}`,
      dob: playerData.dateOfBirth,
      nid: playerData.nationalId.slice(-4), // Only last 4 digits for privacy
      org: playerData.orgId,
      status: playerData.registrationStatus,
      issued: playerData.issuedAt,
      expires: playerData.validUntil
    };

    // Convert to JSON string
    const jsonPayload = JSON.stringify(qrPayload);

    // Generate QR code as data URL
    const qrCodeDataURL = await QRCode.toDataURL(jsonPayload, {
      width: defaultOptions.width,
      errorCorrectionLevel: defaultOptions.errorCorrectionLevel,
      color: defaultOptions.color
    });

    return qrCodeDataURL;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw new Error('Failed to generate QR code');
  }
}

// Verify and parse QR code data
export function parsePlayerQRCode(qrData: string): PlayerCardData | null {
  try {
    const parsed = JSON.parse(qrData);
    
    // Validate required fields
    if (!parsed.v || !parsed.pid || !parsed.upid || !parsed.name) {
      return null;
    }

    // Check if QR code is expired
    const expiryDate = new Date(parsed.expires);
    if (expiryDate < new Date()) {
      throw new Error('Player card has expired');
    }

    // Reconstruct player data
    const [firstName, ...lastNameParts] = parsed.name.split(' ');
    const lastName = lastNameParts.join(' ');

    return {
      playerId: parsed.pid,
      upid: parsed.upid,
      firstName,
      lastName,
      dateOfBirth: parsed.dob,
      nationalId: parsed.nid, // Will only have last 4 digits
      orgId: parsed.org,
      registrationStatus: parsed.status,
      issuedAt: parsed.issued,
      validUntil: parsed.expires
    };
  } catch (error) {
    console.error('Error parsing QR code:', error);
    return null;
  }
}

// Generate verification URL for online validation
export function generateVerificationURL(upid: string, baseURL = 'https://jamiitourney.com'): string {
  return `${baseURL}/verify/${upid}`;
}

// Create player card data from registry entry
export function createPlayerCardData(player: PlayerRegistry): PlayerCardData {
  const now = new Date();
  const validUntil = new Date();
  validUntil.setFullYear(now.getFullYear() + 1); // Valid for 1 year

  return {
    playerId: player.id.toString(),
    upid: player.upid || '',
    firstName: player.firstName || '',
    lastName: player.lastName || '',
    dateOfBirth: player.dob || '',
    nationalId: player.nationalId || '',
    orgId: player.orgId || '',
    registrationStatus: player.registrationStatus || 'DRAFT',
    issuedAt: now.toISOString(),
    validUntil: validUntil.toISOString()
  };
}

// Download QR code as image file
export function downloadQRCode(dataURL: string, filename: string): void {
  try {
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataURL;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Error downloading QR code:', error);
    throw new Error('Failed to download QR code');
  }
}

// Batch generate QR codes for multiple players
export async function batchGenerateQRCodes(
  players: PlayerRegistry[],
  options: QRCodeOptions = {}
): Promise<Array<{ player: PlayerRegistry; qrCode: string; error?: string }>> {
  const results: Array<{ player: PlayerRegistry; qrCode: string; error?: string }> = [];

  for (const player of players) {
    try {
      const playerData = createPlayerCardData(player);
      const qrCode = await generatePlayerQRCode(playerData, options);
      results.push({ player, qrCode });
    } catch (error) {
      results.push({ 
        player, 
        qrCode: '', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  }

  return results;
}