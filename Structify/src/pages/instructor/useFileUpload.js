import { useState } from 'react';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { useAuth } from '../../context/authContextProvider';

const useFileUpload = () => {
  const { currentUser } = useAuth();
  const storage = getStorage();
  const [uploadProgress, setUploadProgress] = useState({});
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleFileUpload = async (event, type, onUploadComplete) => {
    const files = Array.from(event.target.files);
    setError(null);
    for (const file of files) {
      try {
        const timestamp = Date.now();
        const uniqueFilename = `${timestamp}_${file.name}`;
        const fileRef = ref(storage, `${type}/${currentUser.section}/${uniqueFilename}`);
        const metadata = {
          contentType: file.type,
          customMetadata: {
            uploadedBy: currentUser.uid,
            section: currentUser.section,
            uploadDate: new Date().toISOString()
          }
        };
        setUploadProgress(prev => ({ ...prev, [file.name]: 0 }));
        const uploadTask = uploadBytesResumable(fileRef, file, metadata);
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setUploadProgress(prev => ({ ...prev, [file.name]: progress }));
          },
          (error) => {
            let errorMessage = `Failed to upload ${file.name}`;
            if (error.code === 'storage/unauthorized') {
              errorMessage = 'You are not authorized to upload files. Please check your permissions.';
            } else if (error.code === 'storage/canceled') {
              errorMessage = 'Upload was canceled.';
            } else if (error.code === 'storage/unknown') {
              errorMessage = 'An unknown error occurred. Please try again.';
            } else if (error.code === 'storage/cors') {
              errorMessage = 'CORS error occurred. Please try again.';
            }
            setError(errorMessage);
          },
          async () => {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            setUploadProgress(prev => ({ ...prev, [file.name]: 100 }));
            setSuccess(`Successfully uploaded ${file.name}`);
            if (onUploadComplete) {
              onUploadComplete({
                name: file.name,
                type: file.type,
                url: downloadURL,
                size: file.size,
                uploadDate: new Date().toISOString()
              });
            }
          }
        );
      } catch (error) {
        setError(`Failed to upload ${file.name}: ${error.message}`);
      }
    }
  };

  return { handleFileUpload, uploadProgress, error, success, setError, setSuccess };
};

export default useFileUpload; 