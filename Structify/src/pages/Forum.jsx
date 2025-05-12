import React, { useEffect, useState } from "react";
import { collection, getDocs, addDoc, serverTimestamp, query, orderBy, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../services/firebaseConfig";
import { useNavigate } from 'react-router-dom';
import Header from '../components/AdminHeader';
import exit from '../assets/images/X Icon.png';
import profile from '../assets/images/sample profile.png';
import UploadIcon from '../assets/images/Upload Icon.png';
import { useAuth } from '../context/authContextProvider';
import ThreeDots from '../assets/images/Threedot Icon.png';

const Forum = () => {
    const navigate = useNavigate();
    const [showModal, setShowModal] = useState(false);
    const [postType, setPostType] = useState('Question');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const { currentUser } = useAuth();
    const [posts, setPosts] = useState([]);
    const [menuOpenId, setMenuOpenId] = useState(null);
    const [editPostId, setEditPostId] = useState(null);
    const [postToDelete, setPostToDelete] = useState(null);

    useEffect(() => {
        const fetchPosts = async () => {
            const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
            const querySnapshot = await getDocs(q);
            const postsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setPosts(postsData);
        };
        fetchPosts();
    }, []);

    const openEditModal = (post) => {
        setEditPostId(post.id);
        setPostType(post.type);
        setTitle(post.title);
        setDescription(post.description);
        setShowModal(true);
        setMenuOpenId(null);
    };

    const handleAddPost = async (e) => {
        e.preventDefault();
        if (!currentUser) return;
        if (editPostId) {
            // Edit mode
            const postRef = doc(db, "posts", editPostId);
            await updateDoc(postRef, {
                type: postType,
                title,
                description,
            });
        } else {
            // Add mode
            await addDoc(collection(db, "posts"), {
                type: postType,
                title,
                description,
                user: {
                    uid: currentUser.uid,
                    name: currentUser.name,
                    email: currentUser.email,
                },
                createdAt: serverTimestamp(),
            });
        }
        setShowModal(false);
        setPostType('Question');
        setTitle('');
        setDescription('');
        setEditPostId(null);
        // Refetch posts after add/edit
        const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        const postsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setPosts(postsData);
    };

    const handleDeletePost = async (postId) => {
        await deleteDoc(doc(db, "posts", postId));
        setMenuOpenId(null);
        setPostToDelete(null);
        // Refetch posts after delete
        const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        const postsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setPosts(postsData);
    };

    return(
    <div className="bg-[#0e1344] min-h-screen">
        <Header />

        {/* 🔙 Exit Button */}
        <div className="flex justify-end m-8">
            <button onClick={() => navigate(-1)} className="z-10">
                <img src={exit} alt="Close" className="w-6 h-6 cursor-pointer" />
            </button>
        </div>

        <div className="max-w-7xl mx-auto mt-6 p-6 rounded-lg shadow h-[75vh] overflow-y-auto bg-gray-200">
            <div className="flex justify-end mb-4">
                <button
                    className="bg-[#141a35] text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-[#1f274d] transition"
                    onClick={() => {
                        setEditPostId(null);
                        setPostType('Posts');
                        setTitle('');
                        setDescription('');
                        setShowModal(true);
                    }}
                >
                    Add Post
                </button>
            </div>
            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
                    <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md relative">
                        <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600" onClick={() => { setShowModal(false); setEditPostId(null); }}>&times;</button>
                        <h2 className="text-lg font-semibold mb-4">{editPostId ? 'Edit Post' : 'Add New Post'}</h2>
                        <form onSubmit={handleAddPost} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Type of Post</label>
                                <select
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                                    value={postType}
                                    onChange={e => setPostType(e.target.value)}
                                    required
                                >
                                    <option value="Posts">Posts</option>
                                    <option value="Question">Question</option>
                                    <option value="Announcement">Announcement</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Title</label>
                                <input
                                    type="text"
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Description</label>
                                <textarea
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    rows={4}
                                    required
                                />
                            </div>
                            <div className="flex justify-end gap-2">
                                <button type="button" className="px-4 py-2 rounded bg-gray-200 text-gray-700" onClick={() => { setShowModal(false); setEditPostId(null); }}>Cancel</button>
                                <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">{editPostId ? 'Save Changes' : 'Submit'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            <div className="flex flex-wrap justify-center gap-4">
                {posts.map(post => (
                    <div key={post.id} className="relative flex flex-col my-6 bg-white shadow-sm border border-slate-200 rounded-lg w-96">
                        {/* Three-dot menu icon */}
                        <button
                            className="absolute top-3 right-3 z-20"
                            onClick={() => setMenuOpenId(menuOpenId === post.id ? null : post.id)}
                        >
                            <img src={ThreeDots} alt="menu" className="w-1 h-4 filter invert opacity-40 cursor-pointer" />
                        </button>
                        {/* Dropdown menu */}
                        {menuOpenId === post.id && (
                            <div className="absolute top-10 right-3 bg-white border border-slate-200 rounded shadow-lg z-30 w-28">
                                <button className="block w-full text-left px-4 py-2 hover:bg-gray-100 cursor-pointer" onClick={() => openEditModal(post)}>Edit</button>
                                <button className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600 cursor-pointer" onClick={() => setPostToDelete(post.id)}>Delete</button>
                            </div>
                        )}
                        {/* Content */}
                        <div className="p-4">
                            {/* Type of Post */}
                            <div className="mb-4 rounded-full bg-cyan-600 py-0.5 px-2.5 border border-transparent text-xs text-white transition-all shadow-sm w-20 text-center">
                                {post.type?.toUpperCase()}
                            </div>
                            {/* Title */}
                            <h6 className="mb-2 text-slate-800 text-xl font-semibold">
                                {post.title}
                            </h6>
                            {/* Description */}
                            <p className="text-slate-600 leading-normal font-light">
                                {post.description}
                            </p>
                        </div>
                        {/* User Info */}
                        <div className="flex items-center justify-between p-4">
                            <div className="flex items-center">
                                {/* Profile Picture */}
                                <img
                                    alt={post.user?.name || "User"}
                                    src={profile}
                                    className="relative inline-block h-8 w-8 rounded-full"
                                />
                                {/* User Info */}
                                <div className="flex flex-col ml-3 text-sm">
                                    <span className="text-slate-800 font-semibold">{post.user?.name}</span>
                                    <span className="text-slate-600">
                                        {post.createdAt?.toDate ? post.createdAt.toDate().toLocaleString([], { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}
                                    </span>
                                </div>
                            </div>
                        </div>
                        {/* Comment Section */}
                        <div className="px-4 pb-4 flex items-center">
                            <input
                                type="text"
                                placeholder="Add class comment..."
                                className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200 text-sm bg-white"
                            />
                            <img src={UploadIcon} alt="upload" className="w-6 h-6 cursor-pointer ml-2 filter invert opacity-30" />
                        </div>
                    </div>
                ))}
            </div>
            {/* Delete Confirmation Modal */}
            {postToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
                    <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-sm relative">
                        <h2 className="text-lg font-semibold mb-4">Delete Post</h2>
                        <p className="mb-6">Are you sure you want to delete this post? This action cannot be undone.</p>
                        <div className="flex justify-end gap-2">
                            <button className="px-4 py-2 rounded bg-gray-200 text-gray-700 cursor-pointer" onClick={() => setPostToDelete(null)}>Cancel</button>
                            <button className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 cursor-pointer" onClick={() => handleDeletePost(postToDelete)}>Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    </div>
    );
};

export default Forum;
