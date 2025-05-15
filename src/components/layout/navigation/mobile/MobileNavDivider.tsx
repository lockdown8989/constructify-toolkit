
interface MobileNavDividerProps {
  label?: string;
}

const MobileNavDivider = ({ label }: MobileNavDividerProps) => {
  return (
    <div className="flex items-center my-3 mx-6">
      {label && (
        <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider mr-2">
          {label}
        </p>
      )}
      <div className={`h-[1px] bg-neutral-200 w-full ${label ? '' : 'my-0'}`} />
    </div>
  );
};

export default MobileNavDivider;
