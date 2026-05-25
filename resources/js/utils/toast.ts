import { toast } from 'sonner';

export const notification = ({
    message = 'Success Notification !',
    type = 'success',
}) => {
    switch (type) {
        case 'success':
            return toast.success(message);
        case 'info':
            return toast.success(message);
        case 'warning':
            return toast.warning(message);
        case 'error':
            return toast.error(message);
        default:
            return toast(message);
    }
};
