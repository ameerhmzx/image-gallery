import {XIcon} from "@heroicons/react/solid";
import {Fragment, useContext, useEffect} from "react";
import ToastContext from "../Context/ToastContext";
import {Transition} from '@headlessui/react'

export default function Toast() {

    let {toastState, showToast} = useContext(ToastContext);

    let colors = {
        'success': ' bg-green-100 border-green-600 text-green-800 ',
        'fail': ' bg-red-100 border-red-600 text-red-800 '
    }

    function closeToast() {
        showToast({
            title: toastState.title,
            text: toastState.text,
            timeout: undefined,
            type: 'success',
            show: false
        });
    }

    useEffect(() => {
        const timer = setTimeout(() => {
            showToast({
                title: toastState.title,
                text: toastState.text,
                timeout: undefined,
                type: 'success',
                show: false
            });
        }, 2000);
        return () => clearTimeout(timer);
    }, [toastState, showToast]);

    return (
        <Transition
            as={Fragment}
            show={toastState.show === undefined? true: toastState.show}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
        >
            <div
                className={`fixed bottom-4 min-w-1/5 max-w-2/5 sm:top-4 sm:bottom-auto left-4 right-4 sm:left-auto min-w-64 max-w-screen ml-4 
                backdrop-filter backdrop-blur-lg rounded-md border-l-4 p-4 z-40 bg-opacity-60
                ${colors[toastState.type]}`}
                role="alert">
                <div className={'flex justify-between w-full'}>
                    <p className="font-bold pr-8">
                        {toastState.title}
                    </p>
                    <span>
                <XIcon className={'w-4 cursor-pointer'} onClick={closeToast}/>
            </span>
                </div>
                <p>
                    {toastState.text}
                </p>
            </div>
        </Transition>
    );
}