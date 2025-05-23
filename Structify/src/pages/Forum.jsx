import React, { useEffect, useState } from "react";
import { collection, getDocs, addDoc, serverTimestamp, query, orderBy, doc, updateDoc, deleteDoc, arrayUnion } from "firebase/firestore";
import { db } from "../services/firebaseConfig";
import { useNavigate } from 'react-router-dom';
import Header from '../components/AdminHeader';
import exit from '../assets/images/X Icon.png';
import profile from '../assets/images/sample profile.png';
import UploadIcon from '../assets/images/Upload Icon.png';
import { useAuth } from '../context/authContextProvider';
import ThreeDots from '../assets/images/Threedot Icon.png';
import { MessageSquare, HelpCircle, Bell, Plus, Check, X, Send, Edit2, Trash2, Calendar, User, Clock, MessageCircle } from 'lucide-react';

 
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
    const [commentInputs, setCommentInputs] = useState({});
    const [commentMenuOpen, setCommentMenuOpen] = useState({ postId: null, commentIdx: null });
    const [editCommentData, setEditCommentData] = useState({ postId: null, commentIdx: null, text: '' });

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
        try {
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
                    comments: [] // Initialize empty comments array
                });
            }
            setShowModal(false);
            setPostType('Posts');
            setTitle('');
            setDescription('');
            setEditPostId(null);
            // Refetch posts after add/edit
            const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
            const querySnapshot = await getDocs(q);
            const postsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setPosts(postsData);
        } catch (error) {
            console.error("Error saving post:", error);
            alert("Failed to save post. Please try again.");
        }
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

    const handleAddComment = async (postId) => {
        try {
            if (!currentUser || !commentInputs[postId] || commentInputs[postId].trim() === '') return;
            
            const postRef = doc(db, "posts", postId);
            const newComment = {
                user: {
                    uid: currentUser.uid,
                    name: currentUser.name,
                    email: currentUser.email,
                },
                comment: commentInputs[postId],
                date: new Date().toISOString(),
            };
            
            // Get the current post to check if comments array exists
            const postSnap = await getDocs(query(collection(db, "posts"), orderBy("createdAt", "desc")));
            const currentPost = postSnap.docs.find(doc => doc.id === postId)?.data() || {};
            
            // If comments array doesn't exist yet, create it
            if (!Array.isArray(currentPost.comments)) {
                await updateDoc(postRef, {
                    comments: [newComment]
                });
            } else {
                // Otherwise use arrayUnion to add to existing array
                await updateDoc(postRef, {
                    comments: arrayUnion(newComment)
                });
            }
            
            console.log("Comment added successfully!");
            
            // Clear the input
            setCommentInputs(inputs => ({ ...inputs, [postId]: '' }));
            
            // Refetch posts to update UI
            const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
            const querySnapshot = await getDocs(q);
            const postsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setPosts(postsData);
        } catch (error) {
            console.error("Error adding comment:", error);
            alert("Failed to add comment. Please try again.");
        }
    };

    const handleEditComment = async (postId, commentIdx, newText) => {
        try {
            const postRef = doc(db, "posts", postId);
            
            // Get the current post data
            const postSnap = await getDocs(query(collection(db, "posts"), orderBy("createdAt", "desc")));
            const currentPost = postSnap.docs.find(doc => doc.id === postId);
            
            if (!currentPost) {
                console.error("Post not found");
                return;
            }
            
            const postData = currentPost.data();
            const updatedComments = [...postData.comments];
            
            // Update the specific comment
            if (updatedComments[commentIdx]) {
                updatedComments[commentIdx] = {
                    ...updatedComments[commentIdx],
                    comment: newText,
                    edited: true
                };
                
                // Update the post with the modified comments array
                await updateDoc(postRef, {
                    comments: updatedComments
                });
                
                // Refresh posts
                const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
                const querySnapshot = await getDocs(q);
                const postsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setPosts(postsData);
                
                // Reset edit state
                setEditCommentData({ postId: null, commentIdx: null, text: '' });
            }
        } catch (error) {
            console.error("Error editing comment:", error);
            alert("Failed to edit comment. Please try again.");
        }
    };
    
    const handleDeleteComment = async (postId, commentIdx) => {
        try {
            const postRef = doc(db, "posts", postId);
            
            // Get the current post data
            const postSnap = await getDocs(query(collection(db, "posts"), orderBy("createdAt", "desc")));
            const currentPost = postSnap.docs.find(doc => doc.id === postId);
            
            if (!currentPost) {
                console.error("Post not found");
                return;
            }
            
            const postData = currentPost.data();
            const updatedComments = [...postData.comments];
            
            // Remove the specific comment
            updatedComments.splice(commentIdx, 1);
            
            // Update the post with the modified comments array
            await updateDoc(postRef, {
                comments: updatedComments
            });
            
            // Refresh posts
            const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
            const querySnapshot = await getDocs(q);
            const postsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setPosts(postsData);
            
            // Reset menu state
            setCommentMenuOpen({ postId: null, commentIdx: null });
        } catch (error) {
            console.error("Error deleting comment:", error);
            alert("Failed to delete comment. Please try again.");
        }
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

        <div className="max-w-7xl mx-auto mt-6 p-6 rounded-lg shadow h-[75vh] overflow-y-auto bg-gray-200">            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center space-x-2">
                    <div className="flex items-center bg-[#141a35]/80 text-white text-sm font-medium px-4 py-2.5 rounded-lg shadow-md">
                        <MessageSquare className="w-5 h-5 mr-2 text-blue-400" />
                        <span>Forum Discussion</span>
                    </div>
                    <div className="flex items-center bg-[#141a35]/60 text-white text-sm font-medium px-3 py-2 rounded-lg">
                        <Bell className="w-4 h-4 mr-2 text-yellow-400" />
                        <span>Notifications</span>
                    </div>
                </div>
                <button
                    className="bg-gradient-to-r from-blue-600 to-blue-800 text-white text-sm font-medium px-4 py-2.5 rounded-lg hover:from-blue-700 hover:to-blue-900 transition shadow-md flex items-center"
                    onClick={() => {
                        setEditPostId(null);
                        setPostType('Posts');
                        setTitle('');
                        setDescription('');
                        setShowModal(true);
                    }}
                >
                    <Plus className="w-4 h-4 mr-2" />
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
                            {/* Type of Post */}                            <div className={`mb-4 rounded-full py-1 px-3 border border-transparent text-xs text-white transition-all shadow-sm inline-flex items-center ${
                                post.type === 'Question' ? 'bg-orange-500' : 
                                post.type === 'Announcement' ? 'bg-purple-600' : 
                                'bg-cyan-600'
                            }`}>
                                {post.type === 'Question' && <HelpCircle className="w-3 h-3 mr-1" />}
                                {post.type === 'Announcement' && <Bell className="w-3 h-3 mr-1" />}
                                {post.type === 'Posts' && <MessageSquare className="w-3 h-3 mr-1" />}
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
                        {/* Comment Section */}                        <div className="px-4 pb-4 flex items-center">
                            <input
                                type="text"
                                placeholder="Add class comment..."
                                className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200 text-sm bg-white"
                                value={commentInputs[post.id] || ''}
                                onChange={e => setCommentInputs(inputs => ({ ...inputs, [post.id]: e.target.value }))}
                            />
                            <button 
                                className="ml-2 p-2 rounded-full bg-blue-500 hover:bg-blue-600 transition-colors text-white" 
                                onClick={() => handleAddComment(post.id)}
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </div>
                        {/* Display Comments */}
                        {Array.isArray(post.comments) && post.comments.length > 0 && (
                            <div className="px-4 pb-2">
                                {post.comments.map((c, idx) => (
                                    <div key={idx} className="flex items-center mb-2 text-sm relative">
                                        <div className="flex-1">
                                            {editCommentData.postId === post.id && editCommentData.commentIdx === idx ? (
                                                <div className="flex items-center">
                                                    <input 
                                                        type="text" 
                                                        className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm mr-2" 
                                                        value={editCommentData.text} 
                                                        onChange={(e) => setEditCommentData({...editCommentData, text: e.target.value})}
                                                    />
                                                    <button 
                                                        className="text-blue-600 text-xs mr-2"
                                                        onClick={() => handleEditComment(post.id, idx, editCommentData.text)}
                                                    >
                                                        Save
                                                    </button>
                                                    <button 
                                                        className="text-gray-500 text-xs"
                                                        onClick={() => setEditCommentData({ postId: null, commentIdx: null, text: '' })}
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            ) : (
                                                <>
                                                    <span className="font-semibold text-slate-800 mr-2">{c.user?.name}:</span>
                                                    <span className="text-slate-700 mr-2">{c.comment}</span>
                                                    <span className="text-slate-400 text-xs">
                                                        {c.date ? new Date(c.date).toLocaleString([], { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}
                                                        {c.edited && <span className="ml-1">(edited)</span>}
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                        
                                        {/* Only show options for the user's own comments */}
                                        {currentUser && c.user?.uid === currentUser.uid && !editCommentData.postId && (
                                            <div className="relative">
                                                <button 
                                                    className="ml-2 text-gray-400 hover:text-gray-600"
                                                    onClick={() => setCommentMenuOpen(
                                                        commentMenuOpen.postId === post.id && commentMenuOpen.commentIdx === idx
                                                        ? { postId: null, commentIdx: null }
                                                        : { postId: post.id, commentIdx: idx }
                                                    )}
                                                >
                                                    <img src={ThreeDots} alt="menu" className="w-1 h-4 filter invert opacity-40 cursor-pointer" />
                                                </button>
                                                
                                                {/* Comment Options Menu */}
                                                {commentMenuOpen.postId === post.id && commentMenuOpen.commentIdx === idx && (
                                                    <div className="absolute right-0 top-6 bg-white border border-slate-200 rounded shadow-lg z-30 w-20">
                                                        <button 
                                                            className="block w-full text-left px-3 py-1 hover:bg-gray-100 text-xs"
                                                            onClick={() => {
                                                                setEditCommentData({ 
                                                                    postId: post.id, 
                                                                    commentIdx: idx, 
                                                                    text: c.comment 
                                                                });
                                                                setCommentMenuOpen({ postId: null, commentIdx: null });
                                                            }}
                                                        >
                                                            Edit
                                                        </button>
                                                        <button 
                                                            className="block w-full text-left px-3 py-1 hover:bg-gray-100 text-red-600 text-xs"
                                                            onClick={() => handleDeleteComment(post.id, idx)}
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
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
