import React, { useState, type FormEvent } from 'react'
import Navbar from '../components/Navbar'
import FileUploader from '~/components/FileUploader'

const upload = () => {

    const[isProcessing, setIsProcessing] = useState(false)
    const[statusText, setStatusText] = useState('');

    const[file, setFile] = useState<File | null>(null);

    const handleFileSelect = (file: File | null) => {
        setFile(file);
    }
    
    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget.closest('form');
        if(!form) return;

        const formData = new FormData(form);
        const companyName = formData.get('company-name');
        const jobTitle = formData.get('job-title');
        const jobDescription = formData.get('job-description');

        console.log('Company Name:', companyName);
        console.log('Job Title:', jobTitle);
        console.log('Job Description:', jobDescription);
        console.log('Selected File:', file);
    };
    
  return (
    <main className="bg-[url('/images/bg-main.svg')] bg-cover">
        <Navbar />

        <section className='main-section'>
            <div className='page-heading py-16'>
                <h1>Smart feedback for your dream job</h1>

                {isProcessing ? (
                    <>
                    <h2>{statusText}</h2>
                    <img src="/images/resume-scan.gif" alt="Loading" className='w-full' />
                    </>
                ) : (
                    <h2>Upload your resume for an ATS score and improvement suggestions</h2>
                )}

                {!isProcessing && (
                    <form id="upload-form" onSubmit={handleSubmit} className="flex flex-col gap-4 mt-8">
                        
                        <div className="form-div">
                            <label htmlFor="company-name">Company Name</label>
                            <input type="text" name="company-name" placeholder="Enter company name" id="company-name" />
                        </div>

                         
                        <div className="form-div">
                            <label htmlFor="job-title">Job Title</label>
                            <input type="text" name="job-title" placeholder="Enter job title" id="job-title" />
                        </div>

                        <div className="form-div">
                            <label htmlFor="job-description">Job Description</label>
                            <textarea rows={5} name="job-description" placeholder="Enter job description" id="job-description" />
                        </div>

                        <div className="form-div">
                            <label htmlFor="uploader">Upload Resume</label>
                           <FileUploader onFileSelect={handleFileSelect}/>

                        </div>

                     <button className='primary-button' type="submit">
                            Analyze Resume
                        </button>

                    </form>
                )
                }
            </div>
        </section>
    </main>  
    )
}

export default upload