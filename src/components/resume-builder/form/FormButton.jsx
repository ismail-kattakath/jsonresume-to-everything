import { MdAddCircle, MdRemoveCircle } from "react-icons/md";

const FormButton = ({ size, remove, add, label = "Item" }) => {
  return (
    <div className="flex flex-wrap gap-2 my-2">
      <button
        type="button"
        onClick={add}
        aria-label={`Add ${label}`}
        className="inline-flex items-center gap-2 px-3 py-1.5 text-white bg-[deepskyblue] rounded hover:bg-[#00a0e3] transition-colors text-sm cursor-pointer"
      >
        <MdAddCircle className="text-lg" />
        <span>Add {label}</span>
      </button>
      {size > 0 && remove && (
        <button
          type="button"
          onClick={remove}
          aria-label={`Remove ${label}`}
          className="inline-flex items-center gap-2 px-3 py-1.5 text-white bg-[deepskyblue] rounded hover:bg-[#00a0e3] transition-colors text-sm cursor-pointer"
        >
          <MdRemoveCircle className="text-lg" />
          <span>Remove {label}</span>
        </button>
      )}
    </div>
  );
};

export default FormButton;
