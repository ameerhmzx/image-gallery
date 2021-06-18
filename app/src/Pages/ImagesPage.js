import {useParams} from 'react-router-dom';
import {useCallback, useContext, useEffect, useState} from "react";

import LoadingContext from "../Context/LoadingContext";
import ToastContext from "../Context/ToastContext";
import GalleryLayout from "../Components/Gallery";
import Server from "../utils/Server"

import {Transition} from "@headlessui/react";
import {PlusIcon} from "@heroicons/react/solid";
import AddImageDialog from "../Components/AddImageDialog";
import axios from "axios";

function getImageSize(url) {
    return new Promise((resolve, reject) => {
        let img = new Image();
        img.onload = () => resolve(reduce(img.width, img.height));
        img.onerror = () => reject();
        img.src = url;
    });
}

function reduce(numerator, denominator) {
    let gcd = function gcd(a, b) {
        return b ? gcd(b, a % b) : a;
    };
    gcd = gcd(numerator, denominator);
    return {width: numerator / gcd, height: denominator / gcd};
}

async function mapToPhoto(image) {
    let {width, height} = await getImageSize(image['path']);
    return {
        src: image['path'],
        width,
        height
    };
}

async function mapToPhotos(images) {
    let photos = [];
    for (let image of images)
        photos.push(await mapToPhoto(image));
    return photos;
}

export default function ImagesPage() {
    let {folderId} = useParams();
    let {setLoading} = useContext(LoadingContext);
    let {showToast} = useContext(ToastContext);
    let [photos, setPhotos] = useState([]);
    let [addImageDialogShow, setAddImageDialogShow] = useState(false);

    // TODO: paginate

    const loadImages = useCallback(() => {
        setLoading(true);
        Server.get(`/folder/${folderId}/images/`)
            .then(async response => {
                if (response.statusText === 'OK') {
                    let res = response.data;
                    if (res['status'] === 'success') {
                        setPhotos(await mapToPhotos(res['data']));
                    } else {
                        showToast({
                            title: 'Failed',
                            text: 'Unable to load Images',
                            type: 'fail'
                        });
                    }
                } else
                    showToast({
                        title: 'Failed',
                        text: 'Unable to load Images',
                        type: 'fail'
                    });
            }).finally(() => {
            setLoading(false);
        });

    }, [setLoading, showToast, folderId]);

    useEffect(() => {
        loadImages();
    }, [loadImages]);

    function uploadImage(image, onComplete, onError) {
        setLoading(true);
        let formData = new FormData();
        formData.append('image', image);
        Server.post(`/folder/${folderId}/images/`, formData)
            .then(async response => {
                if (response.statusText === 'OK') {
                    let res = response.data;
                    if (res['status'] === 'success') {
                        let newState = photos.slice();
                        newState.unshift(await mapToPhoto(res['data']));
                        setPhotos(newState);
                        onComplete();
                        showToast({
                            title: 'Success',
                            text: 'Image Uploaded!',
                            type: 'success'
                        });
                    } else {
                        showToast({
                            title: 'Failed',
                            text: 'Unable to upload Image',
                            type: 'fail'
                        });
                        onError();
                    }
                } else {
                    showToast({
                        title: 'Failed',
                        text: 'Unable to upload Image',
                        type: 'fail'
                    });
                    onError();
                }
            }).finally(() => {
            setLoading(false);
        });
    }

    return (
        <AddImageDialog
            mainAction={uploadImage}
            show={addImageDialogShow}
            closeDialog={() => setAddImageDialogShow(false)}>
            <div className={`w-full h-full bg-indigo-50 overflow-y-auto p-2`}>
                <div className={`container mx-auto`}>
                    <GalleryLayout photos={photos}/>
                </div>
                {/*FAB*/}
                <Transition
                    appear
                    className={'fixed bottom-0 right-0'}
                    show={!addImageDialogShow}
                    enter="transition duration-500 ease-out"
                    enterFrom="transform scale-75 opacity-0"
                    enterTo="transform scale-100 opacity-100"
                    leave="transition duration-300 ease-out"
                    leaveFrom="transform scale-100 opacity-100"
                    leaveTo="transform scale-75 opacity-0"
                >
                    <div
                        onClick={() => setAddImageDialogShow(true)}
                        className='mr-4 mb-6 md:mr-12 md:mb-8 bg-indigo-500 p-3 rounded-full shadow-sm
                        hover:shadow-md duration-300 cursor-pointer z-20 hover:bg-indigo-700'>
                        <PlusIcon className={'w-6 text-white'}/>
                    </div>
                </Transition>
            </div>
        </AddImageDialog>
    );
}