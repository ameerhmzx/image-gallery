import {useState} from "react";
import {BrowserRouter as Router, Switch, Route, Redirect} from "react-router-dom";

import AuthContext from "./Context/AuthContext";
import LoadingContext from "./Context/LoadingContext";
import ToastContext from "./Context/ToastContext";

import GalleryLayout from './Layouts/GalleryLayout';
import AuthPage from './Pages/AuthPage';
import SharedPage from './Pages/SharedPage';
import LoadingBar from "./Components/LoadingBar";
import Toast from "./Components/Toast";
import FolderPage from "./Pages/FolderPage";
import ImagesPage from "./Pages/ImagesPage";
import ProfilePage from "./Pages/ProfilePage";
import AlertDialog from "./Components/AlertDialog";

function checkAuth() {
    let token = sessionStorage.getItem('jwtToken');
    return (token != null && token !== '');
}

export default function App() {

    const [authState, changeAuthState] = useState(checkAuth());
    const [isLoading, setLoading] = useState(false);
    const [toastState, showToast] = useState({
        show: false
    });

    return (
        <ToastContext.Provider value={{toastState, showToast}}>
            <LoadingContext.Provider value={{isLoading, setLoading}}>
                <AlertDialog>
                    <AuthContext.Provider value={{authState, changeAuthState}}>
                        {isLoading && <LoadingBar/>}
                        <Toast/>
                        <Router>
                            <Switch>
                                <Route path="/login">
                                    {authState && <Redirect to='/photos'/>}
                                    <AuthPage/>
                                </Route>
                                <Route path="/register">
                                    {authState && <Redirect to='/photos'/>}
                                    <AuthPage/>
                                </Route>
                                {authState &&
                                <GalleryLayout>
                                    <Switch>
                                        <Route path="/profile">
                                            <ProfilePage/>
                                        </Route>
                                        <Route path="/shared/:folderId">
                                            <ImagesPage/>
                                        </Route>
                                        <Route path="/shared">
                                            <SharedPage/>
                                        </Route>
                                        <Route path="/photos/:folderId">
                                            <ImagesPage/>
                                        </Route>
                                        <Route path="/photos">
                                            <FolderPage/>
                                        </Route>
                                        <Route path="*">
                                            404
                                        </Route>
                                    </Switch>
                                </GalleryLayout>
                                }
                                <Route path="*">
                                    {authState ? <Redirect to='/photos'/> : <Redirect to='/login'/>}
                                </Route>
                            </Switch>
                        </Router>
                    </AuthContext.Provider>
                </AlertDialog>
            </LoadingContext.Provider>
        </ToastContext.Provider>
    );
}