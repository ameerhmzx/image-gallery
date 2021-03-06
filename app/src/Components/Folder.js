import {CogIcon, DotsVerticalIcon, MinusCircleIcon, TrashIcon} from "@heroicons/react/outline";
import {Menu, Transition} from '@headlessui/react';
import {XIcon} from "@heroicons/react/solid";
import {Link} from "react-router-dom";
import {getUserId} from "../utils/AuthUtils";

import {useContext, useRef, useState} from "react";
import AlertDialogContext from "../Context/AlertDialogContext";
import LoadingContext from "../Context/LoadingContext";
import ToastContext from "../Context/ToastContext";
import Server from "../utils/Server";

import {LazyLoadImage} from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import FolderOptionContext from "../Context/FolderOptionContext";

function formatDate(date) {
    let d = new Date(date);
    return `${d.getDate()}/${d.getMonth()}/${d.getFullYear()}`;
}

export default function Folder({folder, loadFolders, photo_path='photos'}) {
    const [isShowing, setShowing] = useState(true);
    let {showAlertDialog} = useContext(AlertDialogContext);
    let {setLoading} = useContext(LoadingContext);
    let {showToast} = useContext(ToastContext);
    let {setFolder:showFolderOptions} = useContext(FolderOptionContext);

    const userid = useRef(getUserId(sessionStorage.getItem('jwtToken')))["current"];

    function deleteFolder() {
        setLoading(true);
        Server
            .delete(`/folder/${folder._id}`)
            .then(res => {
                showToast({
                    title: 'Success',
                    text: `Folder named '${res.data['data']['name']}' deleted successfully!`,
                    type: 'success'
                });
                setShowing(false);
                setTimeout(() => {
                    loadFolders();
                }, 200);
            })
            .catch(err => {
                showToast({
                    title: 'Failed',
                    text: 'Unable to delete folder',
                    type: 'fail'
                });
            })
            .finally(() => setLoading(false));
    }

    function onDeleteClick() {
        showAlertDialog({
            show: true,
            type: 'danger',
            mainActionText: 'Delete',
            title: 'Are you sure?',
            content: `Deleted folders are unrecoverable. Make sure '${folder.name}' is the folder you want to delete.`,
            onMainAction: () => {
                deleteFolder();
            }
        });
    }

    function removeFolder() {
        setLoading(true);
        Server
            .delete(`/folder/${folder._id}/partners/${userid}`)
            .then(res => {
                showToast({
                    title: 'Success',
                    text: `Folder removed successfully!`,
                    type: 'success'
                });
                setTimeout(loadFolders, 200);
            })
            .catch(err => {
                showToast({
                    title: 'Failed',
                    text: 'Unable to remove folder',
                    type: 'fail'
                });
            })
            .finally(() => setLoading(false));
    }

    function onRemoveClick() {
        showAlertDialog({
            show: true,
            type: 'danger',
            mainActionText: 'Remove',
            title: 'Are you sure?',
            content: `Make sure '${folder.name}' is the folder you want to remove. 
            You won't be able to access this folder unless owner of this folder share this again.`,
            onMainAction: removeFolder
        });
    }

    function onOptionsClick() {
        showFolderOptions(folder);
    }

    // Verify Ownership
    let isOwner = false;
    if (typeof folder.owner === "string")
        isOwner = folder.owner === userid;
    else if (typeof folder.owner === "object")
        isOwner = folder.owner['_id'] === userid;

    return (
        <Transition
            appear
            show={isShowing}
            enter="ease-out transform transition-all duration-300"
            enterFrom="opacity-100 scale-75"
            enterTo="opacity-100 scale-100"
            leave="ease-in transform transition-all duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-75"
        >
            <div className={'relative w-full max-w-sm mx-auto sm:mx-0 folder'}>
                <Link
                    to={`/${photo_path}/${folder._id}`}
                    id={folder._id}
                    className={'overflow-hidden bg-white min-w-32 min-h-64 rounded-md ' +
                    ' ring-1 ring-indigo-100' +
                    ' hover:shadow-md' +
                    ' duration-300 cursor-pointer flex flex-col items-center justify-content'}>

                    {folder.thumb ?
                        <LazyLoadImage
                            className={'object-cover h-36 w-full'}
                            wrapperClassName={'bg-indigo-100'}
                            src={folder.thumb}
                            effect="blur"
                            alt={`Folder named ${folder.name}`}
                        /> :
                        <svg className={`h-36 w-full text-indigo-200 filter blur-sm`} fill="none"
                             viewBox="0 0 24 24">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"
                                  strokeWidth="1.5"
                                  d="M7.5 7.75H6.75C5.64543 7.75 4.75 8.64543 4.75 9.75V17.25C4.75 18.3546 5.64543 19.25 6.75 19.25H16.8358C17.7267 19.25 18.1729 18.1729 17.5429 17.5429L4.75 4.75M9.75 4.75H14.3333C14.737 4.75 15.1011 4.99274 15.2564 5.36538L15.9936 7.13462C16.1489 7.50726 16.513 7.75 16.9167 7.75H17.25C18.3546 7.75 19.25 8.64543 19.25 9.75V15.25M9.92321 10.5C9.20637 11.0962 8.75 11.9948 8.75 13C8.75 14.7949 10.2051 16.25 12 16.25C13.0052 16.25 13.9038 15.7936 14.5 15.0768"/>
                        </svg>
                    }

                    <div
                        className='py-4 px-4 w-full'>
                        <p className={`text-indigo-900 font-semibold whitespace-nowrap overflow-hidden overflow-ellipsis`}>{folder.name}</p>
                        <p className={`-mt-1 text-xs text-indigo-400 `}>Created
                            at: {formatDate(folder.createdAt)}</p>
                    </div>
                </Link>
                <Menu as={'div'}
                      className={'absolute right-0 top-0 flex items-center justify-center duration-500 menu rounded-tr-md rounded-bl-md bg-indigo-500 bg-opacity-30 hover:bg-opacity-80'}>
                    <Menu.Button className={'relative outline-none focus:outline-none'}>
                        {({open}) =>
                            <div>
                                <DotsVerticalIcon
                                    className={`duration-300 w-8 h-8 px-2 py-1 text-gray-50 transform
                            ${open ? 'rotate-90 opacity-0' : 'rotate-0 opacity-100'}`}/>
                                <XIcon className={`absolute top-0 left-0 duration-300 w-8 h-8 px-2 py-1 text-gray-50 transform
                            ${open ? 'rotate-90 opacity-100' : 'rotate-0 opacity-0'}`}/>
                            </div>
                        }
                    </Menu.Button>
                    <Transition
                        enter="transition duration-100 ease-out"
                        enterFrom="transform scale-95 opacity-0"
                        enterTo="transform scale-100 opacity-100"
                        leave="transition duration-75 ease-out"
                        leaveFrom="transform scale-100 opacity-100"
                        leaveTo="transform scale-95 opacity-0"
                    >
                        <Menu.Items
                            className={'absolute z-30 right-0 mt-6 mr-2 origin-top-right outline-none outline-gray-300 ' +
                            'rounded-md outline-none shadow-lg bg-white py-1 flex flex-col text-gray-700'}>
                            {isOwner &&
                                <Menu.Item>
                                    {({active}) => (
                                        <button
                                            onClick={onOptionsClick}
                                            className={`${active && 'bg-indigo-600 text-white'} 
                                        text-sm pl-2 pr-4 py-2 whitespace-nowrap flex items-center
                                        rounded-md mx-1
                                        outline-none focus:outline-none`}>
                                            <CogIcon className={'w-4 mx-1'}/>
                                            Options
                                        </button>
                                    )}
                                </Menu.Item>
                            }
                            {
                                isOwner ?
                                    <Menu.Item>
                                        {({active}) => (
                                            <button
                                                onClick={onDeleteClick}
                                                className={`
                                        ${active && 'bg-red-600 text-white'} 
                                        text-sm pl-2 pr-4 py-2 whitespace-nowrap flex items-center
                                        rounded-md mx-1
                                        outline-none focus:outline-none`}>
                                                <TrashIcon className={'w-4 mx-1'}/>
                                                Delete
                                            </button>
                                        )}
                                    </Menu.Item>
                                    :
                                    <Menu.Item>
                                        {({active}) => (
                                            <button
                                                onClick={onRemoveClick}
                                                className={`
                                        ${active && 'bg-red-600 text-white'} 
                                        text-sm pl-2 pr-4 py-2 whitespace-nowrap flex items-center
                                        rounded-md mx-1
                                        outline-none focus:outline-none`}>
                                                <MinusCircleIcon className={'w-4 mx-1'}/>
                                                Remove
                                            </button>
                                        )}
                                    </Menu.Item>
                            }
                        </Menu.Items>
                    </Transition>
                </Menu>
            </div>
        </Transition>
    );
}
