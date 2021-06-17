import {Dialog, Transition} from "@headlessui/react";
import {Fragment, useEffect, useState} from "react";

import PropTypes from "prop-types";
import {PhotographIcon} from "@heroicons/react/outline";
import {ArrowUpIcon} from "@heroicons/react/solid";

export default function AddImageDialog(props) {
    const [allowUpload, setAllowUpload] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [imageValue, setImageValue] = useState(undefined);
    const [image, setImage] = useState(undefined);

    function onImageSelect(e) {
        if (e.target.files && e.target.files[0]) {
            let image = e.target.files[0];
            setImageValue(image);
        }
    }

    function closeDialog() {
        props.closeDialog()
        // Wait till dialog close
        setTimeout(() => {
            setImageValue(undefined);
        }, 200);
    }

    useEffect(() => {
        if (imageValue !== undefined) {
            let reader = new FileReader();
            reader.readAsDataURL(imageValue);
            reader.onload = (e) => {
                setImage(e.target.result);
            };
        } else
            setImage(undefined);
    }, [imageValue, setImage]);

    useEffect(() => setAllowUpload(imageValue !== undefined), [imageValue, setAllowUpload]);

    function uploadImage() {
        if (allowUpload && imageValue !== undefined) {
            setUploading(true);
            props.mainAction(imageValue, () => {
                setUploading(false);
                closeDialog();
            }, () => {
                setUploading(false);
            });
        }
    }

    return (
        <div className={`w-full h-full`}>
            {props.children}
            <Transition appear show={props.show} as={Fragment}>
                <Dialog
                    as="div"
                    className="fixed inset-0 z-10 overflow-y-auto"
                    onClose={() => !uploading && closeDialog()}
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
                                    Upload New Image
                                </Dialog.Title>
                                <div className="mt-2">

                                    <Transition
                                        appear
                                        show={image !== undefined}
                                        enter="transition duration-300 ease-out"
                                        enterFrom="transform scale-75 opacity-0"
                                        enterTo="transform scale-100 opacity-100"
                                        leave="transition duration-200 ease-out"
                                        leaveFrom="transform scale-100 opacity-100"
                                        leaveTo="transform scale-75 opacity-0"
                                    >
                                        <img className={`w-full h-64 mt-4 object-contain`} src={image}
                                             alt={'Selected'}/>
                                    </Transition>

                                    <div className={`flex items-center justify-center`}>
                                        <label htmlFor='imageUpload'>
                                            <div className={`my-4 flex items-center bg-indigo-700 hover:bg-indigo-900 
                                            cursor-pointer hover:shadow-md duration-300
                                            p-3 rounded-md text-white outline-none focus:outline-none`}>
                                                <PhotographIcon className={`w-5 mr-2`}/>
                                                <p>{image ? 'Reselect' : 'Select Image'}</p>
                                            </div>
                                        </label>
                                        <input id='imageUpload' className={`hidden`} onChange={onImageSelect}
                                               type='file' accept="image/png, image/gif, image/jpeg"/>
                                    </div>
                                </div>

                                <div className="mt-4 w-full flex items-center justify-center space-x-4">
                                    <button
                                        type="button"
                                        className="inline-flex duration-300 justify-center px-4 py-2 text-sm
                                        font-medium text-indigo-900 bg-indigo-100 border border-transparent rounded-md
                                        hover:bg-indigo-200 outline-none focus:outline-none "
                                        onClick={closeDialog}
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="button"
                                        className={`
                                        ${allowUpload ? ' bg-indigo-700 hover:bg-indigo-900 text-white' : ' bg-gray-200 text-gray-700'}
                                        inline-flex duration-300 justify-center px-4 py-2 text-sm font-medium border border-transparent 
                                        rounded-md outline-none flex items-center focus:outline-none`}
                                        onClick={uploadImage}
                                    >
                                        <ArrowUpIcon className={`w-4 mr-2 ${uploading && 'animate-bounce'}`}/>
                                        UPLOAD
                                    </button>
                                </div>
                            </div>
                        </Transition.Child>
                    </div>
                </Dialog>
            </Transition>
        </div>
    );
}

AddImageDialog.propTypes = {
    mainAction: PropTypes.func.isRequired,
    show: PropTypes.bool.isRequired,
    closeDialog: PropTypes.func.isRequired,
    children: PropTypes.element
};
