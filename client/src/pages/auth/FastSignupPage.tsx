import React from 'react';
import { FastSignup } from '@/components/auth/FastSignup';
import { Trophy } from 'lucide-react';

export function FastSignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Trophy className="h-10 w-10 text-primary" />
            <h1 className="text-3xl font-bold text-gray-900">Jamii Tourney</h1>
          </div>
          <p className="text-gray-600">Kenya's Premier Tournament Management Platform</p>
          <p className="mt-2 text-sm text-muted-foreground">Choose your preferred signup method</p>
        </div>
        <FastSignup />
      </div>
    </div>
  );
}