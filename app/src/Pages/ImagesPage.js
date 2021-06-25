import {useLocation, useParams} from 'react-router-dom';
import {useCallback, useContext, useEffect, useMemo, useRef, useState} from "react";

import LoadingContext from "../Context/LoadingContext";
import ToastContext from "../Context/ToastContext";
import GalleryLayout from "../Components/Gallery";
import Server from "../utils/Server"
import AlertDialogContext from "../Context/AlertDialogContext";

import {Transition} from "@headlessui/react";
import {PlusIcon} from "@heroicons/react/solid";
import {IsMounted} from "../utils/IsMounted";
import AddImageDialog from "../Components/AddImageDialog";
import Photo from "../Components/Photo";

function reduce(numerator, denominator) {
    let gcd = function gcd(a, b) {
        return b ? gcd(b, a % b) : a;
    };
    gcd = gcd(numerator, denominator);
    return {width: numerator / gcd, height: denominator / gcd};
}

async function mapToPhoto(image) {
    let {width, height} = reduce(image['width'], image['height']);
    return {
        src: image['path'],
        thumb: image['thumb'],
        id: image['_id'],
        width: width,
        height: height
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
    let {showAlertDialog} = useContext(AlertDialogContext);

    const location = useLocation();
    const isShared = useMemo(() => location.pathname.split('/')[1] === 'shared', [location]);
    let [access, setAccess] = useState(-1);

    useEffect(() => {
        if(isShared && access === -1){
            Server
                .get(`/folder/shared/${folderId}/access`)
                .then(res => {
                    setAccess(res.data['access']);
                })
                .catch(err => {
                    showToast({
                        title: 'Error!',
                        text: 'Error obtaining permissions for this folder!',
                        type: 'fail'
                    });
                })
        }
    }, [isShared, access, showToast, setAccess]);

    let [photos, setPhotos] = useState([]);
    let [addImageDialogShow, setAddImageDialogShow] = useState(false);
    let [deleteKey, setDeleteKey] = useState('');
    let isMounted = IsMounted();

    const [hasMore, setHasMore] = useState(true);
    const [pageNumber, setPageNumber] = useState(0);
    const [isRequesting, setIsRequesting] = useState(false);

    const loadImages = useCallback(() => {
        setLoading(true);
        setIsRequesting(true);
        Server.get(`/folder/${folderId}/images/`)
            .then(async response => {
                if (response.statusText === 'OK') {
                    let res = response.data;
                    if (res['status'] === 'success' && isMounted()) {
                        let photos = await mapToPhotos(res['data']);
                        isMounted() && setPhotos(photos);
                        isMounted() && setHasMore(res['has_more']);
                        isMounted() && setPageNumber(1);
                    } else {
                        showToast({
                            title: 'Failed',
                            text: 'Unable to load Images',
                            type: 'fail'
                        });
                    }
                }
            })
            .catch(() => {
                showToast({
                    title: 'Failed',
                    text: 'Unable to load Images',
                    type: 'fail'
                });
            })
            .finally(() => {
                setLoading(false);
                setIsRequesting(false);
            });

    }, [setLoading, showToast, folderId, isMounted, setPageNumber, setIsRequesting]);

    const loadNextPage = useCallback(() => {
        if (isRequesting || !hasMore) return;
        setIsRequesting(true);
        setLoading(true);
        Server.get(`/folder/${folderId}/images/`, {
            params: {
                'page': pageNumber + 1
            }
        })
            .then(async response => {
                if (response.statusText === 'OK') {
                    let res = response.data;
                    if (res['status'] === 'success' && isMounted()) {
                        let prevPhotos = photos.slice();
                        let nextPhotos = await mapToPhotos(res['data']);
                        isMounted() && setPhotos(prevPhotos.concat(nextPhotos));
                        isMounted() && setHasMore(res['has_more']);
                        isMounted() && setPageNumber(pageNumber + 1);
                    } else {
                        showToast({
                            title: 'Failed',
                            text: 'Unable to load Images',
                            type: 'fail'
                        });
                    }
                }
            })
            .catch(() => {
                showToast({
                    title: 'Failed',
                    text: 'Unable to load Images',
                    type: 'fail'
                });
            })
            .finally(() => {
                setLoading(false);
                setIsRequesting(false);
            });
    }, [setPageNumber, setLoading, showToast, isMounted, setIsRequesting, folderId, hasMore, isRequesting, pageNumber, photos]);

    const deleteImage = useCallback(() => {
        if (deleteKey !== '') {
            setDeleteKey('');
            setLoading(true);
            Server
                .delete(`/folder/${folderId}/images/${deleteKey}/`)
                .then(res => {
                    if (res.statusText === 'OK') {
                        showToast({
                            title: 'Deleted',
                            text: 'Image Deleted Successfully!',
                            type: 'success'
                        });
                        let newPhotos = photos.filter((photo) => photo.id !== deleteKey);
                        setPhotos(newPhotos);
                    }
                })
                .catch(() => {
                    showToast({
                        title: 'Error',
                        text: 'Couldn\'t delete this image',
                        type: 'fail'
                    });
                })
                .finally(() => {
                    setLoading(false);
                });
        }
    }, [deleteKey, setDeleteKey, setLoading, showToast, folderId, photos]);

    useEffect(() => {
        loadImages();
    }, [loadImages]);

    useEffect(() => {
        if (deleteKey !== '') {
            showAlertDialog({
                show: true,
                title: 'Delete Image',
                content: 'Are you sure you want to delete this image?',
                dismissible: true,
                type: 'danger',
                mainActionText: 'Delete',
                cancelText: 'Cancel',
                onMainAction: deleteImage,
                onCancel: () => {
                    setDeleteKey('');
                }
            });
        }
    }, [deleteKey, showAlertDialog, deleteImage]);

    function uploadImage(image, onComplete, onError) {
        setLoading(true);
        let formData = new FormData();
        formData.append('image', image);
        Server
            .post(`/folder/${folderId}/images/`, formData)
            .then(async response => {
                if (response.statusText === 'OK') {
                    let res = response.data;
                    if (res['status'] === 'success' && isMounted()) {
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
                }
            })
            .catch(() => {
                showToast({
                    title: 'Failed',
                    text: 'Unable to upload Image',
                    type: 'fail'
                });
                onError();
            })
            .finally(() => {
                setLoading(false);
            });
    }

    function render_image(thumb) {
        return (
            <Photo
                key={thumb.key || thumb.src}
                id={thumb.id}
                src={thumb.thumb}
                showMenu={(!isShared || access === 1)}
                // onClick={onClick ? handleClick : null}
                alt={thumb.key || `undefined`}
                width={thumb.width}
                height={thumb.height}
                onDelete={(key) => setDeleteKey(key)}
            />);
    }

    const observer = useRef();
    const nextPageRef = useCallback((el) => {
        if (isRequesting) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting) {
                loadNextPage()
            }
        });
        if (el) observer.current.observe(el);
    }, [isRequesting, loadNextPage]);

    return (
        <AddImageDialog
            mainAction={uploadImage}
            show={addImageDialogShow}
            closeDialog={() => setAddImageDialogShow(false)}>
            <div className={`w-full h-full bg-indigo-50 p-2`}>
                <div className={`container mx-auto`}>
                    <GalleryLayout photos={photos} render_image={render_image}/>
                    <div className={`h-14`} ref={nextPageRef}/>
                </div>
                {/*FAB*/}
                { (!isShared || access === 1) &&
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
                }
            </div>
        </AddImageDialog>
    );
}