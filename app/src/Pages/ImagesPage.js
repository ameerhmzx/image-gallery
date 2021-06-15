import {useParams} from 'react-router-dom';
import {useCallback, useContext, useEffect} from "react";
import LoadingContext from "../Context/LoadingContext";
import ToastContext from "../Context/ToastContext";

export default function ImagesPage() {
    let {folderId} = useParams();
    let {setLoading} = useContext(LoadingContext);
    let {showToast} = useContext(ToastContext);

    const loadImages = useCallback(() => {
        // TODO: update code
        setLoading(true);
        fetch(`${process.env.REACT_APP_SERVER_URL}/folder/${folderId}/images/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${sessionStorage.getItem('jwtToken')}`
            }
        }).then(async response => {
            if (response.ok) {
                let res = await response.json();
                if (res['status'] === 'success') {
                    console.log(res);
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
    }, [setLoading, showToast]);

    // useEffect(() => loadImages(), [loadImages]);

    let images = [
        'https://images.ctfassets.net/hrltx12pl8hq/3KWcqxPlvmgkpMS5VdjLAk/3cbdd812faf4b8c343b259656d31a0ee/rendered_15.jpg?fit=fill&w=480&h=270',
        'https://images.unsplash.com/photo-1606787620651-3f8e15e00662?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=634&q=80',
        'https://images.unsplash.com/photo-1623686252990-5c3f81b95956?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80',
        'https://images.unsplash.com/photo-1623646234568-8919b5796bc9?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=634&q=80',
        'https://images.ctfassets.net/hrltx12pl8hq/3KWcqxPlvmgkpMS5VdjLAk/3cbdd812faf4b8c343b259656d31a0ee/rendered_15.jpg?fit=fill&w=480&h=270',
        'https://images.ctfassets.net/hrltx12pl8hq/3KWcqxPlvmgkpMS5VdjLAk/3cbdd812faf4b8c343b259656d31a0ee/rendered_15.jpg?fit=fill&w=480&h=270',
        'https://images.unsplash.com/photo-1606787620651-3f8e15e00662?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=634&q=80',
        'https://images.unsplash.com/photo-1606787620651-3f8e15e00662?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=634&q=80',
        'https://images.unsplash.com/photo-1623686252990-5c3f81b95956?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80',
        'https://images.unsplash.com/photo-1623646234568-8919b5796bc9?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=634&q=80',
        'https://images.ctfassets.net/hrltx12pl8hq/3KWcqxPlvmgkpMS5VdjLAk/3cbdd812faf4b8c343b259656d31a0ee/rendered_15.jpg?fit=fill&w=480&h=270',
        'https://images.unsplash.com/photo-1606787620651-3f8e15e00662?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=634&q=80',
        'https://images.unsplash.com/photo-1623686252990-5c3f81b95956?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80',
        'https://images.unsplash.com/photo-1606787620651-3f8e15e00662?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=634&q=80',
        'https://images.unsplash.com/photo-1623686252990-5c3f81b95956?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80',
        'https://images.unsplash.com/photo-1623686252990-5c3f81b95956?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80',
        'https://images.unsplash.com/photo-1623646234568-8919b5796bc9?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=634&q=80',
        'https://images.ctfassets.net/hrltx12pl8hq/3KWcqxPlvmgkpMS5VdjLAk/3cbdd812faf4b8c343b259656d31a0ee/rendered_15.jpg?fit=fill&w=480&h=270',
        'https://images.unsplash.com/photo-1606787620651-3f8e15e00662?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=634&q=80',
        'https://images.unsplash.com/photo-1623686252990-5c3f81b95956?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80',
        'https://images.unsplash.com/photo-1623646234568-8919b5796bc9?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=634&q=80',
    ];

    return (
        <div className={`w-full h-full bg-indigo-50 overflow-y-auto p-2`}>
            <div className={`container mx-auto flex flex-wrap`}>
            {
                images.map((image, i) =>
                    <div className={`flex-grow`} key={i}>
                        <img className={`h-64 min-w-sm w-full object-cover rounded-md`} src={image} alt={`none`}/>
                    </div>)
            }
            </div>
        </div>
    );
}