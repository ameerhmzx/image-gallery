import {Fragment, useEffect, useMemo, useState} from "react";
import {Transition, Dialog} from "@headlessui/react";
import AlertDialogContext from "../Context/AlertDialogContext";

export default function AlertDialog(props) {
    const defaultDialog = useMemo(() => {
        return {
            show: false,
            title: 'Alert',
            content: '',
            dismissible: true,
            // normal or danger
            type: 'normal',
            mainActionText: 'OK',
            cancelText: 'Cancel'
        }
    }, []);

    let [dialog, showAlertDialog] = useState(defaultDialog);

    useEffect(() => {
        if (!dialog.normalized) {
            let newState = {...dialog};
            let dd = defaultDialog;
            newState.title = newState.title || dd.title;
            newState.content = newState.content || dd.content;
            newState.dismissible = newState.dismissible === undefined ? dd.dismissible : newState.dismissible;
            newState.type = newState.type || dd.type;
            newState.mainActionText = newState.mainActionText || dd.mainActionText;
            newState.cancelText = newState.cancelText || dd.cancelText;
            newState.normalized = true;
            showAlertDialog(newState);
        }
    }, [dialog, showAlertDialog, defaultDialog]);

    function closeDialog(isCancel = true) {
        if (dialog.show) {
            // Default
            let newState = {...dialog};
            newState.show = false;
            showAlertDialog(newState);
        }
        if (isCancel)
            dialog.onCancel && dialog.onCancel();
        dialog.onClose && dialog.onClose();
    }

    function mainAction() {
        dialog.onMainAction && dialog.onMainAction();
        closeDialog(false);
    }

    return (
        <AlertDialogContext.Provider value={{dialog, showAlertDialog}}>
            <div className={`w-full h-full`}>
                {props.children}
                <Transition appear show={dialog.show} as={Fragment}>
                    <Dialog
                        as="div"
                        className="fixed inset-0 z-10 overflow-y-auto"
                        onClose={() => dialog.dismissible && closeDialog()}
                    >
                        <div className="min-h-screen px-4 text-center">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0"
                                enterTo="opacity-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100"
                                leaveTo="opacity-0"
                            >
                                <Dialog.Overlay
                                    className="fixed inset-0 bg-indigo-700 backdrop-filter backdrop-blur-sm bg-opacity-30"/>
                            </Transition.Child>

                            <span
                                className="inline-block h-screen align-middle"
                                aria-hidden="true"
                            >
                          &#8203;
                        </span>
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <div
                                    className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-md">
                                    <Dialog.Title
                                        as="h3"
                                        className="text-lg font-medium leading-6 text-gray-900"
                                    >
                                        {dialog.title}
                                    </Dialog.Title>
                                    <div className="mt-2">
                                        <p className="text-sm text-gray-500">
                                            {dialog.content}
                                        </p>
                                    </div>

                                    <div className="mt-4 w-full flex items-center justify-center space-x-4">
                                        <button
                                            type="button"
                                            className="inline-flex duration-300 justify-center px-4 py-2 text-sm
                                        font-medium text-indigo-900 bg-indigo-100 border border-transparent rounded-md
                                        hover:bg-indigo-200 outline-none focus:outline-none "
                                            onClick={closeDialog}
                                        >
                                            {dialog.cancelText}
                                        </button>

                                        {dialog.type !== 'normal' && <button
                                            type="button"
                                            className={`
                                        ${dialog.type === 'danger' ? 'text-white bg-red-600 hover:bg-red-700' : 'text-white bg-indigo-700 hover:bg-indigo-900'}
                                        inline-flex duration-300 justify-center px-4 py-2 text-sm font-medium border border-transparent 
                                        rounded-md outline-none focus:outline-none`}
                                            onClick={mainAction}
                                        >
                                            {dialog.mainActionText}
                                        </button>}
                                    </div>
                                </div>
                            </Transition.Child>
                        </div>
                    </Dialog>
                </Transition>
            </div>
        </AlertDialogContext.Provider>
    );
}