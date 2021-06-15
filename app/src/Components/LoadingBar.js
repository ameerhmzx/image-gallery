export default function LoadingBar() {
    return (
        <div className={'fixed overflow-hidden w-full top-0 left-0 w-full h-1 z-50'}>
            <div className="absolute h-1 w-full opacity-40 bg-indigo-700"/>
            <div className="absolute h-1 bg-indigo-700 inc"/>
            <div className="absolute h-1 bg-indigo-700 dec"/>
        </div>
    );
}
