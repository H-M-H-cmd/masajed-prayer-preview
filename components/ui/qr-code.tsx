"use client";

import React, { useEffect, useRef, useState } from 'react';
import QRCodeStyling from 'qr-code-styling';
import { Copy, Check, Download } from 'lucide-react';
import { Button } from './button';

interface QRCodeProps {
  code: string;
  image?: string;
  width?: number;
  height?: number;
  domain?: string;
  mosqueName?: string;
}

export const QRCode: React.FC<QRCodeProps> = ({
  code,
  image,
  width = 200,
  height = 200,
  domain = typeof window !== 'undefined' ? window.location.origin : '',
  mosqueName,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const qrRef = useRef<QRCodeStyling | null>(null);
  const [copied, setCopied] = useState(false);

  // const fullUrl = `${domain}/mosques/${code}`;
  const fullUrl = `https://masajed.domais.sa/prayer`;

  const handleCopy = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleDownload = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!qrRef.current) return;

    const scale = 24;
    const scaledWidth = width * scale;
    const scaledHeight = (height + 100) * scale;

    const tempContainer = document.createElement('div');
    const highResQR = new QRCodeStyling({
      width: width * scale,
      height: height * scale,
      type: "svg",
      data: fullUrl,
      dotsOptions: {
        color: "#000000",
        type: "dots",
        gradient: {
          type: 'linear',
          rotation: 0,
          colorStops: [
            { offset: 0, color: '#000000' },
            { offset: 1, color: '#000000' }
          ]
        }
      },
      margin: 5 * scale,
      cornersSquareOptions: {
        type: "extra-rounded",
        color: "#1C614E",
      },
      cornersDotOptions: {
        type: "rounded",
        color: "#1C614E",
      },
      backgroundOptions: {
        color: "#ffffff",
      },
      qrOptions: {
        typeNumber: 0,
        mode: "Byte",
        errorCorrectionLevel: "H"
      },
      ...(image && {
        image,
        imageOptions: {
          crossOrigin: "anonymous",
          margin: 5 * scale,
          imageSize: 0.54
        }
      })
    });

    highResQR.append(tempContainer);
    await new Promise(resolve => setTimeout(resolve, 1000));

    const qrSvg = tempContainer.querySelector('svg');
    if (!qrSvg) return;

    const svgNS = 'http://www.w3.org/2000/svg';
    const newSvg = document.createElementNS(svgNS, 'svg');
    newSvg.setAttribute('xmlns', svgNS);
    newSvg.setAttribute('width', scaledWidth.toString());
    newSvg.setAttribute('height', scaledHeight.toString());
    newSvg.setAttribute('viewBox', `0 0 ${scaledWidth} ${scaledHeight}`);

    // Background
    const bgRect = document.createElementNS(svgNS, 'rect');
    bgRect.setAttribute('x', '0');
    bgRect.setAttribute('y', '0');
    bgRect.setAttribute('width', '100%');
    bgRect.setAttribute('height', '100%');
    bgRect.setAttribute('fill', '#ffffff');
    newSvg.appendChild(bgRect);

    // Header texts
    const codeText = document.createElementNS(svgNS, 'text');
    codeText.setAttribute('x', (10 * scale).toString());
    codeText.setAttribute('y', (20 * scale).toString());
    codeText.setAttribute('font-family', '"Segoe UI", Arial, sans-serif');
    codeText.setAttribute('font-size', (12 * scale).toString());
    codeText.setAttribute('fill', '#666666');
    codeText.textContent = code;
    newSvg.appendChild(codeText);

    const mosqueLabel = document.createElementNS(svgNS, 'text');
    mosqueLabel.setAttribute('x', (scaledWidth / 2).toString());
    mosqueLabel.setAttribute('y', (20 * scale).toString());
    mosqueLabel.setAttribute('text-anchor', 'middle');
    mosqueLabel.setAttribute('font-family', '"Segoe UI", Arial, sans-serif');
    mosqueLabel.setAttribute('font-size', (14 * scale).toString());
    mosqueLabel.setAttribute('fill', '#000000');
    mosqueLabel.textContent = 'مسجد';
    newSvg.appendChild(mosqueLabel);

    const mosqueNameText = document.createElementNS(svgNS, 'text');
    mosqueNameText.setAttribute('x', (scaledWidth / 2).toString());
    mosqueNameText.setAttribute('y', (40 * scale).toString());
    mosqueNameText.setAttribute('text-anchor', 'middle');
    mosqueNameText.setAttribute('font-family', '"Segoe UI", Arial, sans-serif');
    mosqueNameText.setAttribute('font-size', (16 * scale).toString());
    mosqueNameText.setAttribute('font-weight', 'bold');
    mosqueNameText.setAttribute('fill', '#000000');
    mosqueNameText.textContent = mosqueName || '';
    newSvg.appendChild(mosqueNameText);

    // QR code
    const qrGroup = document.createElementNS(svgNS, 'g');
    qrGroup.setAttribute('transform', `translate(0, ${50 * scale})`);
    const qrClone = qrSvg.cloneNode(true) as SVGElement;
    qrGroup.appendChild(qrClone);
    newSvg.appendChild(qrGroup);

    // Footer texts
    const footerText1 = document.createElementNS(svgNS, 'text');
    footerText1.setAttribute('x', (scaledWidth / 2 + 5 * scale).toString());
    footerText1.setAttribute('y', (height * scale + 65 * scale).toString());
    footerText1.setAttribute('text-anchor', 'middle');
    footerText1.setAttribute('font-family', '"Segoe UI", Arial, sans-serif');
    footerText1.setAttribute('font-size', (10 * scale).toString());
    footerText1.setAttribute('fill', '#666666');
    footerText1.textContent = 'للتعرف على المسجد أو للبلاغات والملاحظات';
    newSvg.appendChild(footerText1);

    const footerText2 = document.createElementNS(svgNS, 'text');
    footerText2.setAttribute('x', (scaledWidth / 2 + 5 * scale).toString());
    footerText2.setAttribute('y', (height * scale + 80 * scale).toString());
    footerText2.setAttribute('text-anchor', 'middle');
    footerText2.setAttribute('font-family', '"Segoe UI", Arial, sans-serif');
    footerText2.setAttribute('font-size', (10 * scale).toString());
    footerText2.setAttribute('fill', '#666666');
    footerText2.textContent = 'أو للتواصل مع ادارة المسجد قم بتصوير الرمز';
    newSvg.appendChild(footerText2);

    // Serialize and download
    const svgString = new XMLSerializer().serializeToString(newSvg);
    const blob = new Blob([svgString], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mosque-${mosqueName}-${code}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    if (!code) return;

    qrRef.current = new QRCodeStyling({
      width,
      height,
      type: "svg",
      data: fullUrl,
      dotsOptions: {
        color: "#000000",
        type: "dots"
      },
      margin: 5,
      cornersSquareOptions: {
        type: "extra-rounded",
        color: "#1C614E"
      },
      cornersDotOptions: {
        type: "rounded",
        color: "#1C614E"
      },
      backgroundOptions: {
        color: "#ffffff",
      },
      imageOptions: {
        crossOrigin: "anonymous",
        margin: 5
      },
      qrOptions: {
        typeNumber: 0,
        mode: "Byte",
        errorCorrectionLevel: "Q"
      },
      ...(image && {
        image,
        imageOptions: {
          crossOrigin: "anonymous",
          margin: 5,
          imageSize: 0.54
        }
      })
    });

    if (ref.current) {
      ref.current.innerHTML = '';
      qrRef.current.append(ref.current);
    }
  }, [code, image, width, height, domain, fullUrl]);

  if (!code) return null;

  return (
    <div className="flex flex-col items-center gap-2">
      <div ref={ref} className="flex justify-center items-center rounded-md overflow-hidden" />
      <div className="flex items-center gap-2 bg-muted p-2 px-4 rounded-md w-full max-w-sm">
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={handleCopy}
            title="Copy link"
          >
            {copied ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={handleDownload}
            title="Download QR Code"
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-sm text-muted-foreground truncate flex-1">
          {fullUrl}
        </p>
      </div>
    </div>
  );
};