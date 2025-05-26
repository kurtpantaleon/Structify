import React, { useEffect, useState } from "react";
import { collection, getDocs, addDoc, serverTimestamp, query, orderBy, doc, updateDoc, deleteDoc, arrayUnion } from "firebase/firestore";
import { db } from "../services/firebaseConfig";
import { useNavigate } from 'react-router-dom';
import Header from '../components/AdminHeader';
import profile from '../assets/images/sample profile.png';
import { useAuth } from '../context/authContextProvider';
import ThreeDots from '../assets/images/Threedot Icon.png';
import { MessageSquare, HelpCircle, Bell, Plus, Check, X, Send, Edit2, Trash2, Calendar, User, Clock, MessageCircle, Search, Filter, ArrowUp } from 'lucide-react';

 
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
    const [isLoading, setIsLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedComments, setExpandedComments] = useState({});
    const [scrollToTop, setScrollToTop] = useState(false);
    
    // Check if user has scrolled down enough to show the scroll-to-top button
    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 500) {
                setScrollToTop(true);
            } else {
                setScrollToTop(false);
            }
        };
        
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);
    
    // Scroll to top function
    const scrollToTopFunction = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    useEffect(() => {
        const fetchPosts = async () => {
            setIsLoading(true);
            try {
                const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
                const querySnapshot = await getDocs(q);
                const postsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setPosts(postsData);
            } catch (error) {
                console.error("Error fetching posts:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchPosts();
    }, []);    

    const openEditModal = (post) => {
        // Check if current user is the post owner
        if (!currentUser || !post.user || post.user.uid !== currentUser.uid) {
            console.error("You don't have permission to edit this post");
            alert("You don't have permission to edit this post");
            return;
        }
        
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
                // Edit mode - verify ownership before updating
                const postDoc = await getDocs(query(collection(db, "posts"), orderBy("createdAt", "desc")));
                const post = postDoc.docs.find(doc => doc.id === editPostId);
                
                if (!post) {
                    console.error("Post not found");
                    alert("Post not found");
                    return;
                }
                
                const postData = post.data();
                
                // Check if current user is the post owner
                if (!postData.user || postData.user.uid !== currentUser.uid) {
                    console.error("You don't have permission to edit this post");
                    alert("You don't have permission to edit this post");
                    return;
                }
                
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
    };    const handleDeletePost = async (postId) => {
        try {
            // Get the post to verify ownership
            const postDoc = await getDocs(query(collection(db, "posts"), orderBy("createdAt", "desc")));
            const post = postDoc.docs.find(doc => doc.id === postId);
            
            if (!post) {
                console.error("Post not found");
                return;
            }
            
            const postData = post.data();
            
            // Check if current user is the post owner
            if (!currentUser || !postData.user || postData.user.uid !== currentUser.uid) {
                console.error("You don't have permission to delete this post");
                alert("You don't have permission to delete this post");
                return;
            }
            
            await deleteDoc(doc(db, "posts", postId));
            setMenuOpenId(null);
            setPostToDelete(null);
            
            // Refetch posts after delete
            const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
            const querySnapshot = await getDocs(q);
            const postsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setPosts(postsData);
        } catch (error) {
            console.error("Error deleting post:", error);
            alert("Failed to delete post. Please try again.");
        }
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

    // Filter posts based on activeFilter and searchQuery
    const filteredPosts = posts.filter(post => {
        const matchesFilter = activeFilter === 'All' || post.type === activeFilter;
        const matchesSearch = searchQuery === '' || 
            post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
            post.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesFilter && matchesSearch;
    });
    
    // Toggle comment expansion
    const toggleCommentExpansion = (postId) => {
        setExpandedComments(prev => ({
            ...prev,
            [postId]: !prev[postId]
        }));
    };

    return(
    <div className="bg-gradient-to-b from-[#0e1344] to-[#1a1f50] min-h-screen">
        <Header />

        {/* 🔙 Exit Button */}
        <div className="flex justify-end m-8">
            <button onClick={() => navigate(-1)} className="p-2 rounded-full bg-red-600 hover:bg-red-700 transition-all duration-300 transform hover:scale-105 shadow-lg">
                <X className="w-6 h-6 text-white" />
            </button>
        </div>

        <div className="max-w-7xl mx-auto mt-2 p-6 rounded-xl shadow-2xl h-[78vh] overflow-y-auto bg-gray-100/95 backdrop-blur-sm">
            <div className="flex flex-col md:flex-row md:justify-between items-center mb-8 gap-4">
                <div className="flex items-center space-x-2 w-full md:w-auto">
                    <div className="flex items-center bg-gradient-to-r from-[#141a35] to-[#2a3366] text-white text-sm font-medium px-4 py-2.5 rounded-lg shadow-md">
                        <MessageSquare className="w-5 h-5 mr-2 text-blue-400" />
                        <span>Forum Discussion</span>
                    </div>
                    <div className="flex items-center bg-[#141a35]/60 text-white text-sm font-medium px-3 py-2 rounded-lg hover:bg-[#141a35]/70 transition-all cursor-pointer">
                        <Bell className="w-4 h-4 mr-2 text-yellow-400" />
                        <span>Notifications</span>
                    </div>
                </div>
                
                {/* Search Bar */}
                <div className="relative w-full md:w-auto">
                    <input
                        type="text"
                        placeholder="Search posts..."
                        className="bg-white/80 rounded-lg border border-gray-300 py-2 pl-10 pr-4 w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
                </div>
                
                <button
                    className="bg-gradient-to-r from-blue-600 to-blue-800 text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:from-blue-700 hover:to-blue-900 transition shadow-md flex items-center w-full md:w-auto justify-center transform hover:scale-105 duration-200"
                    onClick={() => {
                        setEditPostId(null);
                        setPostType('Posts');
                        setTitle('');
                        setDescription('');
                        setShowModal(true);
                    }}
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Create New Post
                </button>
            </div>
            
            {/* Filter Tabs */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
                {['All', 'Posts', 'Question', 'Announcement'].map(filter => (
                    <button
                        key={filter}
                        onClick={() => setActiveFilter(filter)}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                            activeFilter === filter 
                                ? 'bg-blue-600 text-white shadow-lg'
                                : 'bg-white/80 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        {filter === 'All' && 'All Posts'}
                        {filter === 'Posts' && <><MessageSquare className="w-3 h-3 inline mr-1" /> Posts</>}
                        {filter === 'Question' && <><HelpCircle className="w-3 h-3 inline mr-1" /> Questions</>}
                        {filter === 'Announcement' && <><Bell className="w-3 h-3 inline mr-1" /> Announcements</>}
                    </button>
                ))}
                <button 
                    className="px-4 py-1.5 rounded-full text-sm font-medium bg-white/80 text-gray-700 hover:bg-gray-200 whitespace-nowrap flex items-center"
                >
                    <Filter className="w-3 h-3 mr-1" /> More Filters
                </button>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/40">
                    <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md relative transform transition-all duration-300 scale-100">
                        <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 p-1" onClick={() => { setShowModal(false); setEditPostId(null); }}>
                            <X className="w-5 h-5" />
                        </button>
                        <h2 className="text-xl font-semibold mb-5 text-gray-800">{editPostId ? 'Edit Post' : 'Create New Post'}</h2>
                        <form onSubmit={handleAddPost} className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium mb-1.5 text-gray-700">Type of Post</label>
                                <select
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={postType}
                                    onChange={e => setPostType(e.target.value)}
                                    required
                                >
                                    <option value="Posts">Post</option>
                                    <option value="Question">Question</option>
                                    <option value="Announcement">Announcement</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1.5 text-gray-700">Title</label>
                                <input
                                    type="text"
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                    placeholder="Enter a title for your post"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1.5 text-gray-700">Description</label>
                                <textarea
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    placeholder="Share your thoughts, questions, or announcements..."
                                    rows={5}
                                    required
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <button type="button" className="px-4 py-2.5 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors" onClick={() => { setShowModal(false); setEditPostId(null); }}>Cancel</button>
                                <button type="submit" className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-blue-800 text-white hover:from-blue-700 hover:to-blue-900 transition-all shadow-md">
                                    {editPostId ? 'Save Changes' : 'Post'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            
            {/* Loading State */}
            {isLoading && (
                <div className="flex flex-col items-center justify-center h-64">
                    <div className="w-12 h-12 rounded-full border-t-2 border-b-2 border-blue-500 animate-spin mb-4"></div>
                    <p className="text-gray-600">Loading posts...</p>
                </div>
            )}
            
            {/* Empty State */}
            {!isLoading && filteredPosts.length === 0 && (
                <div className="flex flex-col items-center justify-center h-64 bg-white/60 backdrop-blur-sm rounded-xl p-8">
                    <MessageCircle className="w-16 h-16 text-gray-300 mb-4" />
                    <h3 className="text-xl font-medium text-gray-800 mb-2">No posts found</h3>
                    <p className="text-gray-600 text-center mb-6">
                        {searchQuery ? 'No results match your search criteria' : 'Be the first to start a discussion!'}
                    </p>
                    <button 
                        className="bg-gradient-to-r from-blue-600 to-blue-800 text-white px-5 py-2.5 rounded-lg hover:from-blue-700 hover:to-blue-900 transition shadow-md flex items-center"
                        onClick={() => {
                            setEditPostId(null);
                            setPostType('Posts');
                            setTitle('');
                            setDescription('');
                            setShowModal(true);
                        }}
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Create New Post
                    </button>
                </div>
            )}
            
            {/* Post Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredPosts.map(post => (
                    <div key={post.id} className="relative flex flex-col bg-white shadow-lg rounded-xl border border-slate-100 transition-all duration-200 hover:shadow-xl hover:translate-y-[-2px] overflow-hidden">                        
                        {/* Three-dot menu icon - only show for post owner */}
                        {currentUser && post.user && post.user.uid === currentUser.uid && (
                            <button
                                className="absolute top-3 right-3 z-20 p-1 hover:bg-gray-100 rounded-full"
                                onClick={() => setMenuOpenId(menuOpenId === post.id ? null : post.id)}
                            >
                                <img src={ThreeDots} alt="menu" className="w-1 h-4 filter invert opacity-60 cursor-pointer" />
                            </button>
                        )}
                        {/* Dropdown menu */}
                        {menuOpenId === post.id && (
                            <div className="absolute top-10 right-3 bg-white border border-slate-100 rounded-lg shadow-xl z-30 w-32 overflow-hidden">
                                {currentUser && post.user && post.user.uid === currentUser.uid && (
                                    <>
                                        <button className="flex items-center w-full text-left px-4 py-2.5 hover:bg-gray-50 cursor-pointer text-sm" onClick={() => openEditModal(post)}>
                                            <Edit2 className="w-3.5 h-3.5 mr-2 text-blue-600" /> Edit
                                        </button>
                                        <button className="flex items-center w-full text-left px-4 py-2.5 hover:bg-gray-50 cursor-pointer text-sm text-red-600" onClick={() => setPostToDelete(post.id)}>
                                            <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete
                                        </button>
                                    </>
                                )}
                                {(!currentUser || !post.user || post.user.uid !== currentUser.uid) && (
                                    <div className="px-4 py-2.5 text-gray-500 text-sm">No options</div>
                                )}
                            </div>
                        )}
                        {/* Content */}
                        <div className="p-5">
                            {/* Type of Post */}                            
                            <div className={`mb-4 rounded-full py-1 px-3.5 text-xs text-white inline-flex items-center ${
                                post.type === 'Question' ? 'bg-gradient-to-r from-orange-500 to-orange-600' : 
                                post.type === 'Announcement' ? 'bg-gradient-to-r from-purple-500 to-purple-700' : 
                                'bg-gradient-to-r from-cyan-500 to-cyan-600'
                            }`}>
                                {post.type === 'Question' && <HelpCircle className="w-3 h-3 mr-1.5" />}
                                {post.type === 'Announcement' && <Bell className="w-3 h-3 mr-1.5" />}
                                {post.type === 'Posts' && <MessageSquare className="w-3 h-3 mr-1.5" />}
                                {post.type?.toUpperCase()}
                            </div>
                            {/* Title */}
                            <h6 className="mb-3 text-slate-800 text-xl font-semibold line-clamp-2">
                                {post.title}
                            </h6>
                            {/* Description */}
                            <p className="text-slate-600 leading-relaxed font-light line-clamp-3 mb-4">
                                {post.description}
                            </p>
                            
                            {/* Post Meta Info */}
                            <div className="flex items-center text-xs text-gray-500 mt-2 space-x-4">
                                <div className="flex items-center">
                                    <Calendar className="w-3.5 h-3.5 mr-1.5" />
                                    <span>
                                        {post.createdAt?.toDate ? 
                                            post.createdAt.toDate().toLocaleDateString([], { month: 'short', day: 'numeric' }) : 
                                            ''}
                                    </span>
                                </div>
                                <div className="flex items-center">
                                    <Clock className="w-3.5 h-3.5 mr-1.5" />
                                    <span>
                                        {post.createdAt?.toDate ? 
                                            post.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 
                                            ''}
                                    </span>
                                </div>
                                <div className="flex items-center">
                                    <MessageCircle className="w-3.5 h-3.5 mr-1.5" />
                                    <span>{Array.isArray(post.comments) ? post.comments.length : 0}</span>
                                </div>
                            </div>
                        </div>
                        {/* User Info */}
                        <div className="flex items-center justify-between p-5 border-t border-slate-100 mt-auto bg-gradient-to-b from-white to-slate-50">
                            <div className="flex items-center">
                                {/* Profile Picture */}
                                <img
                                    alt={post.user?.name || "User"}
                                    src={profile}
                                    className="h-8 w-8 rounded-full object-cover border-2 border-white shadow"
                                />
                                {/* User Info */}
                                <div className="flex flex-col ml-3 text-sm">
                                    <span className="text-slate-800 font-medium">{post.user?.name}</span>
                                </div>
                            </div>
                        </div>
                        {/* Comment Section */}                        
                        <div className="px-5 pb-2">
                            <div className="flex items-center mb-3">
                                <div className="h-px bg-slate-200 flex-grow"></div>
                                <button 
                                    className="mx-2 text-xs font-medium text-blue-600 hover:text-blue-800 flex items-center"
                                    onClick={() => toggleCommentExpansion(post.id)}
                                >
                                    {Array.isArray(post.comments) && post.comments.length > 0 ? (
                                        expandedComments[post.id] ? 'Hide Comments' : `Show ${post.comments.length} Comment${post.comments.length !== 1 ? 's' : ''}`
                                    ) : 'No Comments'}
                                </button>
                                <div className="h-px bg-slate-200 flex-grow"></div>
                            </div>
                            
                            {/* Display Comments */}
                            {expandedComments[post.id] && Array.isArray(post.comments) && post.comments.length > 0 && (
                                <div className="max-h-60 overflow-y-auto mb-3 pr-1 scrollbar-thin">
                                    {post.comments.map((c, idx) => (
                                        <div key={idx} className="flex mb-3 text-sm relative bg-gray-50 rounded-lg p-2.5">
                                            <img
                                                src={profile}
                                                className="h-6 w-6 rounded-full object-cover mr-2 mt-0.5"
                                                alt={c.user?.name || "Commenter"}
                                            />
                                            <div className="flex-1">
                                                {editCommentData.postId === post.id && editCommentData.commentIdx === idx ? (
                                                    <div className="flex flex-col space-y-2">
                                                        <input 
                                                            type="text" 
                                                            className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" 
                                                            value={editCommentData.text} 
                                                            onChange={(e) => setEditCommentData({...editCommentData, text: e.target.value})}
                                                        />
                                                        <div className="flex space-x-2">
                                                            <button 
                                                                className="px-3 py-1 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                                                onClick={() => handleEditComment(post.id, idx, editCommentData.text)}
                                                            >
                                                                Save
                                                            </button>
                                                            <button 
                                                                className="px-3 py-1 text-xs bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                                                                onClick={() => setEditCommentData({ postId: null, commentIdx: null, text: '' })}
                                                            >
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <div className="flex justify-between items-start">
                                                            <span className="font-semibold text-slate-800 mr-1">{c.user?.name}</span>
                                                            
                                                            {/* Only show options for the user's own comments */}
                                                            {currentUser && c.user?.uid === currentUser.uid && !editCommentData.postId && (
                                                                <div className="relative">
                                                                    <button 
                                                                        className="ml-1 text-gray-400 hover:text-gray-600 p-0.5"
                                                                        onClick={() => setCommentMenuOpen(
                                                                            commentMenuOpen.postId === post.id && commentMenuOpen.commentIdx === idx
                                                                            ? { postId: null, commentIdx: null }
                                                                            : { postId: post.id, commentIdx: idx }
                                                                        )}
                                                                    >
                                                                        <img src={ThreeDots} alt="menu" className="w-1 h-3 filter invert opacity-40 cursor-pointer" />
                                                                    </button>
                                                                    
                                                                    {/* Comment Options Menu */}
                                                                    {commentMenuOpen.postId === post.id && commentMenuOpen.commentIdx === idx && (
                                                                        <div className="absolute right-0 top-6 bg-white border border-slate-100 rounded-lg shadow-xl z-30 w-24 overflow-hidden">
                                                                            <button 
                                                                                className="flex items-center w-full text-left px-3 py-1.5 hover:bg-gray-50 text-xs"
                                                                                onClick={() => {
                                                                                    setEditCommentData({ 
                                                                                        postId: post.id, 
                                                                                        commentIdx: idx, 
                                                                                        text: c.comment 
                                                                                    });
                                                                                    setCommentMenuOpen({ postId: null, commentIdx: null });
                                                                                }}
                                                                            >
                                                                                <Edit2 className="w-3 h-3 mr-1.5 text-blue-600" /> Edit
                                                                            </button>
                                                                            <button 
                                                                                className="flex items-center w-full text-left px-3 py-1.5 hover:bg-gray-50 text-xs text-red-600"
                                                                                onClick={() => handleDeleteComment(post.id, idx)}
                                                                            >
                                                                                <Trash2 className="w-3 h-3 mr-1.5" /> Delete
                                                                            </button>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <p className="text-slate-700 mt-0.5">{c.comment}</p>
                                                        <span className="text-slate-400 text-xs mt-1 block">
                                                            {c.date ? new Date(c.date).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}
                                                            {c.edited && <span className="ml-1">(edited)</span>}
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                            
                            {/* Comment Input */}
                            <div className="pb-4 flex items-center">
                                <input
                                    type="text"
                                    placeholder="Write a comment..."
                                    className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                                    value={commentInputs[post.id] || ''}
                                    onChange={e => setCommentInputs(inputs => ({ ...inputs, [post.id]: e.target.value }))}
                                />
                                <button 
                                    className="ml-2 p-2 rounded-full bg-blue-500 hover:bg-blue-600 transition-colors text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                    onClick={() => handleAddComment(post.id)}
                                    disabled={!commentInputs[post.id] || commentInputs[post.id].trim() === ''}
                                >
                                    <Send className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            
            {/* Delete Confirmation Modal */}
            {postToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/40">
                    <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-sm relative animate-fade-in">
                        <h2 className="text-xl font-semibold mb-2 text-gray-800">Delete Post</h2>
                        <p className="mb-6 text-gray-600">Are you sure you want to delete this post? This action cannot be undone.</p>
                        <div className="flex justify-end gap-3">
                            <button className="px-4 py-2.5 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors cursor-pointer" onClick={() => setPostToDelete(null)}>Cancel</button>
                            <button className="px-5 py-2.5 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors cursor-pointer shadow-md" onClick={() => handleDeletePost(postToDelete)}>Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
        
        {/* Scroll to top button */}
        {scrollToTop && (
            <button 
                onClick={scrollToTopFunction}
                className="fixed bottom-6 right-6 p-2.5 bg-blue-600 text-white rounded-full shadow-lg cursor-pointer hover:bg-blue-700 transition-all duration-200 animate-fade-in"
                aria-label="Scroll to top"
            >
                <ArrowUp className="w-5 h-5" />
            </button>
        )}
        
        {/* Add this style to enable custom scrollbar */}
        <style jsx>{`
            .scrollbar-hide::-webkit-scrollbar {
                display: none;
            }
            
            .scrollbar-hide {
                -ms-overflow-style: none;
                scrollbar-width: none;
            }
            
            .scrollbar-thin::-webkit-scrollbar {
                width: 4px;
            }
            
            .scrollbar-thin::-webkit-scrollbar-track {
                background: #f1f1f1;
                border-radius: 10px;
            }
            
            .scrollbar-thin::-webkit-scrollbar-thumb {
                background: #c1c1c1;
                border-radius: 10px;
            }
            
            .animate-fade-in {
                animation: fadeIn 0.3s ease-in-out;
            }
            
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(-10px); }
                to { opacity: 1; transform: translateY(0); }
            }
        `}</style>
    </div>
    );
};

export default Forum;
