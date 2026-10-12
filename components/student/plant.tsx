export function Plant() {
  return (
    <div className="plant-art" aria-hidden="true">
      <svg viewBox="0 0 250 205" fill="none">
        <ellipse cx="132" cy="183" rx="79" ry="10" fill="#d2dfb4" opacity=".5" />
        <path
          d="M119 130C121 89 127 64 152 37M124 104C106 73 87 61 65 48M122 123C146 95 169 85 188 83"
          stroke="#47754d"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <path d="M142 59C124 36 143 9 177 10C178 36 167 58 142 59Z" fill="#729363" />
        <path d="M108 87C77 90 55 74 51 45C84 39 104 58 108 87Z" fill="#96b17c" />
        <path d="M138 111C144 81 167 67 195 76C191 108 169 122 138 111Z" fill="#5b8055" />
        <path d="m98 130 10 45c2 10 35 10 39 0l11-45" fill="#e9ba91" />
        <ellipse cx="128" cy="130" rx="30" ry="8" fill="#d6a77d" />
        <ellipse cx="128" cy="130" rx="24" ry="5" fill="#655b43" />
        <path d="m109 144 6 28m12-29v32m17-31-5 28" stroke="#d69e76" strokeWidth="2" />
        <path d="M200 34v12m-6-6h12M42 114v10m-5-5h10" stroke="#9aab77" strokeWidth="2" strokeLinecap="round" />
        <circle cx="188" cy="139" r="3" fill="#8ca56a" />
        <circle cx="84" cy="24" r="3" fill="#a9b782" />
        <path d="m198 163 4-9 4 9m-7-3h6" stroke="#71825b" strokeWidth="1.5" />
        <path d="M33 76c8-9 16-1 9 6l-9 8h13" stroke="#809369" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <span className="plant-note">
        Un peu chaque jour,
        <br />
        beaucoup plus loin.
      </span>
    </div>
  );
}
