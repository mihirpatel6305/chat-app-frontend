const CircularProgressBar = ({
  uploadImageProgress = 0,
  size = 50,
  strokeWidth = 5,
  color = "#4caf50",
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (uploadImageProgress / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        {/* Background Circle */}
        <circle
          stroke="#ddd"
          fill="transparent"
          strokeWidth={strokeWidth}
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        {/* Progress Circle */}
        <circle
          stroke={color}
          fill="transparent"
          strokeWidth={strokeWidth}
          r={radius}
          cx={size / 2}
          cy={size / 2}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      {/* Centered Text */}
      <div
        className="absolute inset-0 flex justify-center items-center font-bold text-gray-800"
        style={{ fontSize: size * 0.2 }}
      >
        {uploadImageProgress}%
      </div>
    </div>
  );
};

export default CircularProgressBar;
