import { Button } from '../ui/button';

export const ButtonComponent = ({
    type = 'button',
    buttonText,
    ...props
}: any) => {
    return (
        <Button type={type} {...props}>
            <span>{buttonText}</span>
        </Button>
    );
};
