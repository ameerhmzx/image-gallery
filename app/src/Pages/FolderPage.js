import Folder from '../Components/Folder';
import {PlusIcon} from "@heroicons/react/solid";
import {useCallback, useContext, useEffect, useState} from "react";
import {Transition} from "@headlessui/react";

import AddFolderDialog from "../Components/AddFolderDialog";
import LoadingContext from "../Context/LoadingContext";
import ToastContext from "../Context/ToastContext";
import Server from "../utils/Server";
import {IsMounted} from "../utils/IsMounted";

export default function FolderPage() {
    let [folderDialogShow, setFolderDialogShow] = useState(false);
    let [folders, setFolders] = useState([]);
    let {setLoading} = useContext(LoadingContext);
    let {showToast} = useContext(ToastContext);
    let isMounted = IsMounted();

    const loadFolders = useCallback(() => {
        setLoading(true);
        Server.get(`/folder/`)
            .then(response => {
                if (response.statusText === 'OK' && isMounted())
                    setFolders(response.data['data']);
            })
            .catch(err => {
                showToast({
                    title: 'Failed',
                    text: 'Unable to load folders',
                    type: 'fail'
                });
            })
            .finally(() => {
                setLoading(false);
            });
    }, [setLoading, showToast, isMounted]);

    useEffect(() => {
        loadFolders();
    }, [loadFolders]);

    function createFolder(name) {
        setFolderDialogShow(false);
        setLoading(true);
        Server.post(`/folder/`, {
            'name': name
        })
            .then(response => {
                showToast({
                    title: 'Success',
                    text: `New Folder named '${response.data['data']['name']}' created successfully!`,
                    type: 'success'
                });
                loadFolders();
            })
            .catch(err => {
                showToast({
                    title: 'Failed',
                    text: 'Folder name not defined!',
                    type: 'fail'
                });
            })
            .finally(() => {
                setLoading(false);
            });
    }

    return (
        <AddFolderDialog
            show={folderDialogShow}
            closeDialog={() => setFolderDialogShow(false)}
            mainAction={createFolder}>
            <div className={'relative w-full h-full bg-indigo-50 overflow-y-auto'}>
                {/*Grid of Folders*/}
                <div
                    className={'p-4 pb-40 grid grid-flow-cols grid-cols-1 sm:grid-cols-2 md:grid-cols-3 ' +
                    'lg:grid-cols-4 xl:grid-cols-6 xl:container xl:mx-auto items-center gap-3'}>
                    {folders.map((folder, i) =>
                        <Folder key={folder._id} folder={folder} loadFolders={loadFolders}/>
                    )}
                </div>

                {/*FAB*/}
                <Transition
                    appear
                    className={'fixed bottom-0 right-0'}
                    show={!folderDialogShow}
                    enter="transition duration-500 ease-out"
                    enterFrom="transform scale-75 opacity-0"
                    enterTo="transform scale-100 opacity-100"
                    leave="transition duration-300 ease-out"
                    leaveFrom="transform scale-100 opacity-100"
                    leaveTo="transform scale-75 opacity-0"
                >
                    <div
                        onClick={() => setFolderDialogShow(true)}
                        className='mr-4 mb-6 md:mr-12 md:mb-8 bg-indigo-500 p-3 rounded-full shadow-sm
                     hover:shadow-md duration-300 cursor-pointer z-20 hover:bg-indigo-700'>
                        <PlusIcon className={'w-6 text-white'}/>
                    </div>
                </Transition>
            </div>
        </AddFolderDialog>
    );
}
