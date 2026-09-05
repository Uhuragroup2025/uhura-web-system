import React from 'react';

export interface UhuraLogoProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
  color?: string;
  className?: string;
}

/**
 * Official Uhura Group Favicon & Brand Symbol
 * Authentic stylized 'A' vector glyph with dynamic arch crossbar.
 */
export const UhuraLogo: React.FC<UhuraLogoProps> = ({
  size = 24,
  color = 'currentColor',
  className = '',
  ...props
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 360 410"
      width={size}
      height={size}
      fill={color}
      className={`shrink-0 ${className}`}
      aria-label="Uhura Logo"
      {...props}
    >
      <path
        fillRule="evenodd"
        d="M 176 18
           C 192 18, 204 26, 210 40
           L 334 374
           C 343 396, 332 420, 310 429
           C 288 438, 264 427, 255 405
           L 194 96
           C 190 84, 178 84, 174 96
           L 115 265
           C 127 246, 149 233, 176 233
           C 204 233, 226 246, 238 266
           C 246 279, 243 296, 230 304
           C 217 312, 200 308, 192 295
           C 186 284, 174 276, 160 276
           C 138 276, 120 294, 110 316
           L 76 404
           C 67 426, 43 437, 21 428
           C -1 419, -12 395, -3 373
           L 145 39
           C 151 26, 162 18, 176 18
           Z"
      />
    </svg>
  );
};

export default UhuraLogo;
