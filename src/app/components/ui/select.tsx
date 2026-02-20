import * as React from "react"
import { ChevronDown, Check } from "lucide-react"

const Select = ({ value, onValueChange, children }: {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
}) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="relative">
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<any>, {
            value,
            onValueChange,
            isOpen,
            setIsOpen,
          });
        }
        return child;
      })}
    </div>
  );
};

const SelectTrigger = ({ children, value, isOpen, setIsOpen, className = "" }: any) => {
  return (
    <button
      type="button"
      onClick={() => setIsOpen(!isOpen)}
      className={`flex items-center justify-between w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#BE220E] focus:border-transparent ${className}`}
    >
      {children}
      <ChevronDown className="w-4 h-4 text-gray-500 ml-2" />
    </button>
  );
};

const SelectValue = ({ placeholder, value }: any) => {
  return <span className="truncate">{value || placeholder}</span>;
};

const SelectContent = ({ children, value, onValueChange, isOpen, setIsOpen }: any) => {
  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40"
        onClick={() => setIsOpen(false)}
      />
      <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child as React.ReactElement<any>, {
              isSelected: child.props.value === value,
              onClick: () => {
                onValueChange(child.props.value);
                setIsOpen(false);
              },
            });
          }
          return child;
        })}
      </div>
    </>
  );
};

const SelectItem = ({ children, value, isSelected, onClick }: any) => {
  return (
    <div
      onClick={onClick}
      className={`flex items-center justify-between px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 ${
        isSelected ? 'bg-gray-50 font-medium' : ''
      }`}
    >
      <span>{children}</span>
      {isSelected && <Check className="w-4 h-4 text-[#BE220E]" />}
    </div>
  );
};

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem };
