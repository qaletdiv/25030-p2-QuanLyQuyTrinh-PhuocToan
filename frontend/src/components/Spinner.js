export default function Spinner({ size = 'sm', text = '' }) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-5 h-5 border-2',
    lg: 'w-6 h-6 border-[3px]',
  };

  return (
    <div className="inline-flex items-center gap-2">
      <div
        className={`${sizeClasses[size] || sizeClasses.sm} border-current border-t-transparent rounded-full animate-spin shrink-0`}
      />
      {text && <span>{text}</span>}
    </div>
  );
}
