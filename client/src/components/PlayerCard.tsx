import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { 
  Download, 
  Share, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  Clock,
  Calendar,
  MapPin,
  Phone,
  Mail,
  User,
  Shield,
  QrCode
} from 'lucide-react';
import { PlayerRegistry } from '../../../shared/schema';
import { 
  generatePlayerQRCode, 
  createPlayerCardData, 
  downloadQRCode,
  type PlayerCardData 
} from '../lib/qrCodeUtils';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { getPlayerImageProps } from '../lib/imageUtils';
import { useEnhancedPlayerImage } from '../hooks/useEnhancedPlayerImage';
import { format } from 'date-fns';

interface PlayerCardProps {
  player: PlayerRegistry;
  showActions?: boolean;
  compact?: boolean;
}

export default function PlayerCard({ player, showActions = true, compact = false }: PlayerCardProps) {
  const [qrCode, setQrCode] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [cardData, setCardData] = useState<PlayerCardData | null>(null);

  // Use enhanced image loading that checks documents table
  const playerImage = useEnhancedPlayerImage(
    player.id.toString(),
    player.profileImage,
    player.firstName || '',
    player.lastName || ''
  );

  useEffect(() => {
    generateQR();
  }, [player]);

  const generateQR = async () => {
    try {
      setIsGenerating(true);
      const data = createPlayerCardData(player);
      setCardData(data);
      const qr = await generatePlayerQRCode(data);
      setQrCode(qr);
      console.log('QR code generated successfully');
    } catch (error) {
      console.error('Failed to generate QR code:', error);
      // In a real app, show error toast
      alert('Failed to generate QR code. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (qrCode) {
      try {
        const filename = `${player.firstName}_${player.lastName}_PlayerCard.png`;
        downloadQRCode(qrCode, filename);
        // In a real app, show success toast
        console.log('Player card downloaded successfully');
      } catch (error) {
        console.error('Failed to download player card:', error);
        alert('Failed to download player card. Please try again.');
      }
    }
  };

  const handleShare = async () => {
    if (navigator.share && qrCode) {
      try {
        await navigator.share({
          title: `${player.firstName} ${player.lastName} - Player Card`,
          text: 'Digital Player Verification Card',
          url: window.location.href
        });
      } catch (error) {
        // Fallback to copy
        navigator.clipboard?.writeText(window.location.href);
      }
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'REJECTED':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'IN_REVIEW':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'REJECTED':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'IN_REVIEW':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const playerInitials = useMemo(
    () => `${player.firstName?.[0] || ''}${player.lastName?.[0] || ''}`.toUpperCase(),
    [player.firstName, player.lastName]
  );

  if (compact) {
    return (
      <Card className="w-full max-w-sm">
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <Avatar className="h-12 w-12">
              <AvatarImage 
                src={playerImage.src} 
                alt={playerImage.alt}
              />
              <AvatarFallback>
                {playerImage.isLoading ? '⏳' : playerImage.fallbackText}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold truncate">
                {player.firstName} {player.lastName}
              </h3>
              <p className="text-sm text-gray-600 truncate">UPID: {player.upid}</p>
            </div>
            <div className="flex flex-col items-end">
              <Badge className={getStatusColor(player.registrationStatus || 'DRAFT')}>
                {player.registrationStatus || 'DRAFT'}
              </Badge>
              {qrCode && (
                <img src={qrCode} alt="QR Code" className="w-8 h-8 mt-2" />
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="print:w-[85.6mm] print:h-[53.98mm] w-[340px] h-[216px] mx-auto">
      {/* ATM Card Size: 85.60mm × 53.98mm (3.370" × 2.125") */}
      <Card className="w-full h-full bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 text-white border-0 shadow-2xl rounded-lg overflow-hidden">
        <CardContent className="p-0 h-full flex">
          {/* Left Side - Player Info */}
          <div className="flex-1 p-3 flex flex-col justify-between">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold text-blue-100 tracking-wide">
                JAMII TOURNEY
              </div>
              <Badge className="bg-white/20 text-white border-white/30 text-xs px-2 py-0.5">
                {player.registrationStatus || 'DRAFT'}
              </Badge>
            </div>

            {/* Player Photo & Name */}
            <div className="flex items-center space-x-3 my-2">
              <Avatar className="h-12 w-12 border-2 border-white/30 shadow-md">
                <AvatarImage 
                  src={playerImage.src}
                  alt={playerImage.alt}
                />
                <AvatarFallback className="bg-white/20 text-white border-white/30">
                  {playerImage.isLoading ? '⏳' : playerImage.fallbackText}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h2 className="text-sm font-bold text-white truncate">
                  {player.firstName} {player.lastName}
                </h2>
                <p className="text-xs text-blue-200 font-mono">
                  {player.upid}
                </p>
                <div className="flex items-center text-xs text-blue-200 mt-1">
                  <Calendar className="h-3 w-3 mr-1" />
                  <span>{player.dob ? format(new Date(player.dob), 'dd/MM/yyyy') : 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Bottom Info */}
            <div className="flex items-center justify-between text-xs">
              <div className="text-blue-200">
                ID: ***{player.nationalId?.slice(-4) || 'N/A'}
              </div>
              {cardData && (
                <div className="text-blue-200">
                  Valid: {format(new Date(cardData.validUntil), 'MM/yy')}
                </div>
              )}
            </div>
          </div>

          {/* Right Side - QR Code */}
          <div className="w-20 bg-white/10 backdrop-blur-sm p-2 flex flex-col items-center justify-center">
            {isGenerating ? (
              <RefreshCw className="h-8 w-8 animate-spin text-white" />
            ) : qrCode ? (
              <div className="bg-white p-1 rounded">
                <img src={qrCode} alt="QR" className="w-16 h-16" />
              </div>
            ) : (
              <div className="bg-white/20 w-16 h-16 rounded flex items-center justify-center">
                <QrCode className="h-6 w-6 text-white" />
              </div>
            )}
            <div className="text-xs text-center text-blue-200 mt-1 leading-tight">
              SCAN TO VERIFY
            </div>
          </div>
        </CardContent>

        {/* Action Buttons - Only show when not in print/card view */}
        {showActions && (
          <div className="absolute -bottom-16 left-0 right-0 flex space-x-2 px-2 print:hidden">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={handleDownload}
              disabled={!qrCode}
            >
              <Download className="h-4 w-4 mr-1" />
              Download
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={handleShare}
            >
              <Share className="h-4 w-4 mr-1" />
              Share
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={generateQR}
              disabled={isGenerating}
            >
              <RefreshCw className={`h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}