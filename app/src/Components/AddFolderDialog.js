import {Dialog, Transition} from "@headlessui/react";
import {Fragment, useEffect, useState} from "react";
import {FolderAddIcon} from "@heroicons/react/solid";

export default function AddFolderDialog(props) {

    let [folderName, setFolderName] = useState('');

    function folderNameListener(e) {
        setFolderName(e.target.value);
    }

    useEffect(() => {
        setFolderName('');
    }, [props.show]);


    return (<div className={`w-full h-full`}>
        {props.children}
        <Transition appear show={props.show} as={Fragment}>
            <Dialog
                as="div"
                className="fixed inset-0 z-10 overflow-y-auto"
                onClose={props.closeDialog}
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
                                Create New Folder
                            </Dialog.Title>
                            <div className="mt-2">
                                <p className="text-sm text-gray-500">
                                    It's good practice to give a folder concise and meaningful name
                                </p>
                                <div className="flex relative py-4 px-2">
                                            <span
                                                className="rounded-l-md inline-flex  items-center px-3 border-t bg-white border-l border-b  border-gray-300 text-gray-500 shadow-sm text-sm">
                                                <FolderAddIcon className={'w-5 text-gray-500'}/>
                                            </span>
                                    <input type="text"
                                           required
                                           onChange={folderNameListener}
                                           value={folderName}
                                           className={
                                               `rounded-r-lg flex-1 appearance-none border border-gray-300 w-full 
                                                   py-2 px-4 bg-white text-gray-700 placeholder-gray-400 shadow-sm text-base
                                                    focus:outline-none focus:ring-1 focus:ring-indigo-600 focus:border-transparent`
                                           }
                                           placeholder="Folder Name"/>
                                </div>
                            </div>

                            <div className="mt-4 w-full flex items-center justify-center space-x-4">
                                <button
                                    type="button"
                                    className="inline-flex duration-300 justify-center px-4 py-2 text-sm
                                        font-medium text-indigo-900 bg-indigo-100 border border-transparent rounded-md
                                        hover:bg-indigo-200 outline-none focus:outline-none "
                                    onClick={props.closeDialog}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="button"
                                    className={`
                                        text-white bg-indigo-700 hover:bg-indigo-900
                                        inline-flex duration-300 justify-center px-4 py-2 text-sm font-medium border border-transparent 
                                        rounded-md outline-none focus:outline-none`}
                                    onClick={() => props.mainAction(folderName)}
                                >
                                    Add Folder
                                </button>
                            </div>
                        </div>
                    </Transition.Child>
                </div>
            </Dialog>
        </Transition>
    </div>);
}