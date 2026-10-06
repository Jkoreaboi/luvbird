import Image from "next/image";
import { cn } from "@/lib/utils";

type PhoneFrameProps = {
  src: string;
  alt: string;
  priority?: boolean;
  className?: string;
};

export function PhoneFrame({ src, alt, priority = false, className }: PhoneFrameProps) {
  return (
    <div className={cn("w-[232px] sm:w-[268px]", className)}>
      <div className="rounded-[2.4rem] bg-ink p-[9px] shadow-letter">
        <div className="overflow-hidden rounded-[1.95rem] bg-paper">
          <Image
            src={src}
            alt={alt}
            width={780}
            height={1688}
            priority={priority}
            sizes="268px"
            className="h-auto w-full"
          />
        </div>
      </div>
    </div>
  );
}
