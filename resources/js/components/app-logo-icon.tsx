import type { SVGAttributes } from 'react';

export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
    return (
        <svg {...props} viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
            <circle cx="20" cy="20" r="18" fill="#F15F23" />
            <path
                d="M11 21.5C11 15.7 15.1 11 20.4 11C25.7 11 29.8 15.7 29.8 21.5C29.8 27.3 25.7 32 20.4 32C15.1 32 11 27.3 11 21.5ZM15.2 21.5C15.2 24.9 17.4 27.6 20.4 27.6C23.4 27.6 25.6 24.9 25.6 21.5C25.6 18.1 23.4 15.4 20.4 15.4C17.4 15.4 15.2 18.1 15.2 21.5Z"
                fill="white"
            />
            <path
                d="M28.7 8.2L31.1 12.4L35.4 14.7L31.1 17L28.7 21.2L26.4 17L22.1 14.7L26.4 12.4L28.7 8.2Z"
                fill="#FFC857"
            />
        </svg>
    );
}
