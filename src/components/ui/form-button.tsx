import { MdAddCircle, MdRemoveCircle } from 'react-icons/md'
import { BaseButton } from './base-button'

interface FormButtonProps {
  size: number
  remove?: () => void
  add: () => void
  label?: string
}

const FormButton = ({ size, remove, add, label = 'Item' }: FormButtonProps) => {
  return (
    <div className="my-2 flex flex-wrap gap-2">
      <BaseButton
        type="button"
        onClick={add}
        aria-label={`Add ${label}`}
        variant="red"
        size="sm"
        icon={<MdAddCircle className="text-lg" />}
      >
        Add {label}
      </BaseButton>
      {size > 0 && remove && (
        <BaseButton
          type="button"
          onClick={remove}
          aria-label={`Remove ${label}`}
          variant="red"
          size="sm"
          icon={<MdRemoveCircle className="text-lg" />}
        >
          Remove {label}
        </BaseButton>
      )}
    </div>
  )
}

export default FormButton
