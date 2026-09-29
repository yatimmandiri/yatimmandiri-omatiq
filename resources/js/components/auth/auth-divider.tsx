export default function AuthDivider({
    text = 'atau masuk dengan',
}: {
    text?: string;
}) {
    return (
        <div className="relative my-1 text-center text-xs after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-slate-200 dark:after:border-slate-800">
            <span className="relative z-10 bg-white px-3 font-medium text-slate-400 dark:bg-slate-900 dark:text-slate-500">
                {text}
            </span>
        </div>
    );
}
