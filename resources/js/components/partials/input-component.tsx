import { Field } from '@/components/ui/field';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

export const InputTextComponent = ({
    label,
    helperText,
    errors,
    errorMessage,
    className,
    ...props
}: any) => {
    return (
        <Field>
            {label && <Label>{label}</Label>}
            <Input className={className} {...props} />
        </Field>
    );
};

export const InputFileComponent = ({
    label,
    helperText,
    errors,
    errorMessage,
    className,
    ...props
}: any) => {
    return (
        <Field>
            {label && <Label>{label}</Label>}
            <Input type="file" className={className} {...props} />
        </Field>
    );
};

export const InputNumberComponent = () => {
    return <div>InputNumberComponent</div>;
};

export const InputSelectComponent = () => {
    return <div>InputSelectComponent</div>;
};

export const InputCheckboxComponent = () => {
    return <div>InputCheckboxComponent</div>;
};

export const InputRadioComponent = () => {
    return <div>InputRadioComponent</div>;
};

export const InputSwitchComponent = () => {
    return <div>InputSwitchComponent</div>;
};

export const InputTextareaComponent = () => {
    return <div>InputTextareaComponent</div>;
};

export const InputDateComponent = () => {
    return <div>InputDateComponent</div>;
};
