import {Dialog, Transition} from "@headlessui/react";
import {ShareIcon, TrashIcon} from "@heroicons/react/solid";

import {Fragment, useCallback, useContext, useEffect, useState} from "react";
import FolderOptionContext from "../Context/FolderOptionContext";
import Server from "../utils/Server";
import LoadingContext from "../Context/LoadingContext";
import ToastContext from "../Context/ToastContext";


const initialFolder = {
    _id: undefined,
    name: ''
}

const initialPartner = {
    partner: '',
    access: 0
}

export default function FolderOptionsDialog(props) {
    let [folder, setFolder] = useState(initialFolder);
    let [show, setShow] = useState(false);
    let [partners, setPartners] = useState([]);
    let [partnerEntry, setPartnerEntry] = useState(initialPartner);

    let {setLoading} = useContext(LoadingContext);
    let {showToast} = useContext(ToastContext);

    //TODO: update access & delete share

    const loadPartners = useCallback(() => {
        setShow(true);
        setLoading(true);
        Server
            .get(`/folder/${folder._id}/partners`)
            .then(res => setPartners(res.data['data']))
            .catch(() => {
                showToast({
                    type: 'fail',
                    title: 'Failed!',
                    text: 'Unknown error occurred!'
                });
            })
            .finally(() => {
                setLoading(false);
            });
    }, [folder, setLoading, showToast]);

    useEffect(() => {
        if (folder !== undefined && folder._id !== undefined) {
            loadPartners();
        } else {
            close();
        }
    }, [folder, loadPartners]);

    useEffect(() => {
        if (!show)
            setTimeout(() => {
                setFolder(initialFolder);
                setPartnerEntry(initialPartner);
            }, 300);
    }, [show, setFolder]);

    function close() {
        setShow(false);
    }

    function addPartner() {
        setLoading(true);
        Server
            .post(`/folder/${folder._id}/partners`, partnerEntry)
            .then(res => setPartners(res.data['data']))
            .catch(err => {
                if (err.response.status === 409)
                    showToast({
                        type: 'fail',
                        title: 'Failed!',
                        text: 'Already shared with this email.'
                    });
                else
                    showToast({
                        type: 'fail',
                        title: 'Failed!',
                        text: 'Unknown error occurred!'
                    });
            })
            .finally(() => {
                setLoading(false);
                setPartnerEntry(initialPartner);
            });
    }

    function onPartnerEmailChange(e) {
        let value = e.target.value;
        if (value !== partnerEntry.partner) {
            let {access} = partnerEntry;
            setPartnerEntry({
                partner: value,
                access: access
            });
        }
    }

    function onAccessChange(e) {
        let value = parseInt(e.target.value);
        if (value !== partnerEntry.access) {
            let {partner} = partnerEntry;
            setPartnerEntry({
                partner: partner,
                access: value
            });
        }
    }

    function removePartner(partner) {
        setLoading(true);
        Server
            .delete(`/folder/${folder._id}/partners/${partner["user"]["_id"]}`)
            .then(() => {
                loadPartners()
            })
            .catch(() => {
                showToast({
                    title: 'Error',
                    text: 'Unable to remove access!',
                    type: 'fail'
                });
            })
            .finally(() => setLoading(false));
    }

    function onPartnerAccessUpdate(partner, e) {
        let newAccess = e.target.value;
        if (newAccess !== partner.access) {
            setLoading(true);
            Server
                .put(`/folder/${folder._id}/partners/${partner["user"]["_id"]}`, {
                    access: parseInt(newAccess)
                })
                .then(res => {
                    if (res.status === 200) {
                        loadPartners();
                    }
                })
                .catch(() => {
                    showToast({
                        title: 'Error!',
                        text: 'Unable to update access!',
                        type: 'fail'
                    });
                })
                .finally(() =>
                    setLoading(false)
                );
        }
    }

    return (
        <FolderOptionContext.Provider value={{folder: folder, setFolder: setFolder}}>
            <div className={`w-full h-full`}>
                {props.children}
                <Transition appear show={show} as={Fragment}>
                    <Dialog
                        as="div"
                        className="fixed inset-0 z-10 overflow-y-auto"
                        onClose={close}
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
                                    className="inline-block w-full max-w-lg p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-md">
                                    <Dialog.Title
                                        as="h3"
                                        className="text-xl font-medium leading-6 text-gray-900"
                                    >
                                        Folder Options
                                    </Dialog.Title>
                                    <div className="mt-2">

                                        <p className="text-sm text-gray-700">
                                            Folder: {folder.name}
                                        </p>

                                        <div className="flex flex-col py-4 px-2 space-y-4">

                                            <p className={`text-lg`}>Share</p>

                                            <div className={`flex relative`}>
                                                <span
                                                    className="rounded-l-md inline-flex  items-center px-3 border-t bg-white border-l border-b  border-gray-300 text-gray-500 shadow-sm text-sm">
                                                    <ShareIcon className={'w-5 text-gray-500'}/>
                                                </span>

                                                <input type="email"
                                                       required
                                                       value={partnerEntry.partner}
                                                       onChange={onPartnerEmailChange}
                                                       className={
                                                           `rounded-r-lg flex-1 appearance-none border border-gray-300 w-full 
                                                   py-2 px-4 bg-white text-gray-700 placeholder-gray-400 shadow-sm text-base
                                                    focus:outline-none focus:ring-1 focus:ring-indigo-600 focus:border-transparent`
                                                       }
                                                       placeholder="Email Address"/>
                                            </div>

                                            <div className={`flex justify-between items-center`}>
                                                <label className={`flex flex-col text-gray-700 text-sm`}>
                                                    Access Level
                                                    <select
                                                        onChange={onAccessChange}
                                                        value={partnerEntry.access.toString()}
                                                        className={`rounded-md text-gray-700 border-0 ring-1 ring-gray-300`}>
                                                        <option value="0">View Only</option>
                                                        <option value="1">View / Upload</option>
                                                    </select>
                                                </label>

                                                <button
                                                    onClick={addPartner}
                                                    className={`
                                                text-white bg-indigo-700 hover:bg-indigo-900
                                                inline-flex duration-300 justify-center px-4 py-2 text-sm font-medium border border-transparent 
                                                rounded-md outline-none focus:outline-none`}>
                                                    Share
                                                </button>
                                            </div>
                                        </div>

                                        <div className={`flex flex-col py-4 px-2 space-y-2`}>
                                            <p className="text-lg mb-4">Shared With: </p>
                                            {
                                                partners.map((partner) => {
                                                    return (
                                                        <div className={`w-full flex items-center space-x-4`}
                                                             key={partner._id}>
                                                            <div>{partner.user.email}</div>

                                                            <div
                                                                className={`w-full flex items-center justify-end space-x-2`}>
                                                                <select
                                                                    onChange={(e) => onPartnerAccessUpdate(partner, e)}
                                                                    className={`rounded-md text-gray-700 border-0 ring-1 ring-gray-300`} value={partner.access.toString()}>
                                                                    <option value="0">View Only</option>
                                                                    <option value="1">View / Upload</option>
                                                                </select>

                                                                <button
                                                                    onClick={() => removePartner(partner)}
                                                                    className=
                                                                        {`text-white bg-red-700 hover:bg-red-900 
                                                                    cursor-pointer rounded-md px-4 py-2 items-center 
                                                                    flex duration-300 self-left`}>
                                                                    <TrashIcon className={`w-5`}/>
                                                                </button>
                                                            </div>
                                                            <hr className={`my-4`}/>
                                                        </div>
                                                    );
                                                })
                                            }
                                        </div>
                                    </div>

                                    <div className="mt-4 w-full flex items-center justify-center space-x-4">
                                        <button
                                            type="button"
                                            className="inline-flex duration-300 justify-center px-4 py-2 text-sm
                                        font-medium text-indigo-900 bg-indigo-100 border border-transparent rounded-md
                                        hover:bg-indigo-200 outline-none focus:outline-none "
                                            onClick={close}
                                        >
                                            Close
                                        </button>
                                    </div>
                                </div>
                            </Transition.Child>
                        </div>
                    </Dialog>
                </Transition>
            </div>
        </FolderOptionContext.Provider>
    );
}
