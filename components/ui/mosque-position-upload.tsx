import { Plus, X, Loader2 } from "lucide-react";
import { CSSProperties, useRef } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface MosquePositionUploadProps {
  value?: string;
  onChange?: (file: File) => void;
  onDelete?: () => void;
  position: 'center' | 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight' | 'bottomCenter' | 'topCenter' | 
           'front' | 'left' | 'right' | 'back' | 'farLeft' | 'farRight';
  isLoading?: boolean;
}

const LightEffect = ({ rotation, className, style }: { rotation: number, className?: string, style?: CSSProperties }) => (
  <svg 
    width="93" 
    height="81" 
    viewBox="0 0 93 81" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={`${className}`}
    style={{ transform: `rotate(${rotation}deg)`, ...style }}
  >
    <path 
      d="M45.9998 0L92.8322 80.25H0.16748L45.9998 0Z" 
      fill="url(#paint0_linear_164_443)"
    />
    <defs>
      <linearGradient 
        id="paint0_linear_164_443" 
        x1="46.4998" 
        y1="-7.71302e-09" 
        x2="46.4998" 
        y2="107" 
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0.13" stopColor="#CFD8E4"/>
        <stop offset="0.705" stopColor="#D9D9D9" stopOpacity="0"/>
      </linearGradient>
    </defs>
  </svg>
);

const positionStyles: Record<MosquePositionUploadProps['position'], {
  rotation: number;
  lightEffectStyle: CSSProperties;
  lightEffectClassName: string;
  extraText?: string;
}> = {
  topLeft: {
    rotation: -45,
    lightEffectStyle: { translate: '-5px' },
    lightEffectClassName: 'absolute top-0 left-0'
  },
  topRight: {
    rotation: 45,
    lightEffectStyle: { translate: '5px' },
    lightEffectClassName: 'absolute top-0 right-0'
  },
  bottomLeft: {
    rotation: -135,
    lightEffectStyle: { translate: '-5px' },
    lightEffectClassName: 'absolute bottom-0 left-0'
  },
  bottomRight: {
    rotation: 135,
    lightEffectStyle: { translate: '5px' },
    lightEffectClassName: 'absolute bottom-0 right-0'
  },
  center: {
    rotation: 180,
    lightEffectStyle: { translate: '50%' },
    lightEffectClassName: 'absolute bottom-0 right-1/2 -z-10'
  },
  bottomCenter: {
    rotation: 180,
    lightEffectStyle: { translate: '50%' },
    lightEffectClassName: 'absolute bottom-0 right-1/2 -z-10'
  },
  topCenter: {
    rotation: 0,
    lightEffectStyle: { translate: '50%' },
    lightEffectClassName: 'absolute top-0 right-1/2 -z-10'
  },
  front: {
    rotation: 0,
    lightEffectStyle: { translate: '50%' },
    lightEffectClassName: 'absolute top-0 right-1/2 -z-10'
  },
  left: {
    rotation: -90,
    lightEffectStyle: { translate: '-5px 8px', transform: 'rotate(-90deg) translateX(50%)' },
    lightEffectClassName: 'absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2'
  },
  right: {
    rotation: 90,
    lightEffectStyle: { translate: '5px 8px', transform: 'rotate(90deg) translateX(-50%)' },
    lightEffectClassName: 'absolute right-0 top-1/2'
  },
  back: {
    rotation: 180,
    lightEffectStyle: { translate: '0px', transform: 'rotate(180deg) translateX(50%)' },
    lightEffectClassName: 'absolute bottom-0 left-1/2'
  },
  farLeft: {
    rotation: 180,
    lightEffectStyle: { translate: '0px', transform: 'rotate(180deg) translateX(50%)' },
    lightEffectClassName: 'absolute bottom-0 left-1/2',
    extraText: 'مدخل المعاقين'
  },
  farRight: {
    rotation: 180,
    lightEffectStyle: { translate: '0px', transform: 'rotate(180deg) translateX(-50%)' },
    lightEffectClassName: 'absolute bottom-0 right-1/2',
    extraText: 'مدخل مصلى النساء'
  },
};

export function MosquePositionUpload({ value, onChange, onDelete, position, isLoading }: MosquePositionUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const styles = positionStyles[position];

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onChange?.(file);
    }
  };

  if (isLoading) {
    return (
      <div className="relative">
        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
          <Loader2 className="h-4 w-4 animate-spin" />
        </div>
      </div>
    );
  }

  if (value) {
    return (
      <div className="relative group">
        <Image 
          src={value} 
          alt="Mosque position"
          width={40} 
          height={40}
          className="rounded-full object-cover w-10 h-10 z-30 relative"
        />
        <button
          onClick={onDelete}
          className="absolute z-40 -top-2 -right-2 p-1 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <X className="h-3 w-3" />
        </button>
        <LightEffect 
          rotation={styles?.rotation ?? 0}
          className={cn(styles?.lightEffectClassName ?? '', 'z-10')}
          style={styles?.lightEffectStyle ?? {}}
        />
      </div>
    );
  }

  return (
    <>
      <input
        type="file"
        ref={inputRef}
        onChange={handleChange}
        accept="image/*"
        className="hidden"
      />
      <button 
        onClick={handleClick}
        className="relative z-30 p-1 rounded-full bg-[#D9D9D9]"
      >
        <LightEffect 
          rotation={styles?.rotation ?? 0}
          className={cn(styles?.lightEffectClassName ?? '', 'z-10')}
          style={styles?.lightEffectStyle ?? {}}
        />
        <Plus className="relative z-20 h-4 w-4 text-green-500" />
      </button>
      {styles?.extraText && (
        <div className="absolute z-20 text-xs text-center right-1/2 translate-x-1/2 text-nowrap">
          {styles.extraText}
        </div>
      )}
    </>
  );
} 