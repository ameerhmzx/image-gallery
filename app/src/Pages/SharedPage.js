import Folder from '../Components/Folder';
import {useCallback, useContext, useEffect, useState} from "react";

import LoadingContext from "../Context/LoadingContext";
import ToastContext from "../Context/ToastContext";
import Server from "../utils/Server";
import {IsMounted} from "../utils/IsMounted";
import FolderOptionsDialog from "../Components/FolderOptionsDialog";

export default function FolderPage() {
    let [folders, setFolders] = useState([]);
    let {setLoading} = useContext(LoadingContext);
    let {showToast} = useContext(ToastContext);
    let isMounted = IsMounted();

    const loadFolders = useCallback(() => {
        setLoading(true);
        Server.get(`/folder/shared`)
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

    return (
        <FolderOptionsDialog>
            <div className={'relative w-full h-full bg-indigo-50 overflow-y-auto'}>
                {/*Grid of Folders*/}
                <div
                    className={'p-4 pb-40 grid grid-flow-cols grid-cols-1 sm:grid-cols-2 md:grid-cols-3 ' +
                    'lg:grid-cols-4 xl:grid-cols-6 xl:container xl:mx-auto items-center gap-3'}>
                    {folders.map((folder, i) =>
                        <Folder key={folder._id} folder={folder} loadFolders={loadFolders} photo_path={'shared'}/>
                    )}
                </div>
            </div>
        </FolderOptionsDialog>
    );
}
