import React, { useState, type FormEvent } from 'react'
import Navbar from '~/components/Navbar'
import FileUploader from '~/components/FileUploader'
import { usePuterStore } from '~/lib/puter';
import { useNavigate } from 'react-router'
import { convertPdfToImage } from '~/lib/pdf2img';
import { prepareInstructions } from '../../constants';
import { generateUUID } from "~/lib/utils";

const upload = () => {
    const { auth, fs, isLoading, ai, kv } = usePuterStore();
    const navigate = useNavigate()
    const [isProcessing, setIsProcessing] = useState(false)
    const [statusText, setStatusText] = useState('');

    const [file, setFile] = useState<File | null>(null);

    const handleFileSelect = (file: File | null) => {
        setFile(file);
    }

    const handleAnalyzer = async (
        {
            companyName,
            jobTitle,
            jobDescription,
            file
        }:
            {
                companyName: string,
                jobTitle: string,
                jobDescription: string,
                file: File
            }

    ) => {
        setIsProcessing(true);
        setStatusText('Analyzing your resume...');
        const uploadedFile = await fs.upload([file]);

        if (!uploadedFile) {
            setStatusText('Failed to upload file. Please try again.');
            return;
        }

        setStatusText('Converting to image...');

        const imageFile = await convertPdfToImage(file);

        if (!imageFile.file) {
            return setStatusText('Failed to convert PDF to image. Please ensure your PDF is valid and try again.');
        }

        setStatusText('Uploading image...');
        const uploadedImage = await fs.upload([imageFile.file]);
        if (!uploadedImage) {
            setStatusText('Failed to upload image. Please try again.');
            return;
        }

        setStatusText('Preparing analysis...');

        const uuid = generateUUID();
        const data = {
            id: uuid,
            resumePath: uploadedFile.path,
            imagePath: uploadedImage.path,
            companyName,
            jobTitle, jobDescription,
            feedback: '',

        }
        await kv.set(`resume:${uuid}`, JSON.stringify(data));

        setStatusText('Analyzing...');

        const feedback = await ai.feedback(
            uploadedFile.path,
            prepareInstructions(
                {
                    jobTitle,
                    jobDescription,
                    //AIResponseFormat: "json",
                }
            )
        );

        if (!feedback) {
            setStatusText('Failed to analyze resume. Please try again.');
            return;
        }

        const feedbackText = typeof feedback.message.content === 'string'
            ? feedback.message.content
            : feedback.message.content[0].text;

        //---------------------------------
        // console.log("RAW AI RESPONSE:");
        // console.log(feedbackText);

        //------------------------------


        try {
            const cleanedText = feedbackText
                .replace(/```json/g, '')
                .replace(/```/g, '')
                .trim();

            data.feedback = JSON.parse(cleanedText);

            // console.log("Parsed Feedback:", data.feedback);
        } catch (error) {
            // console.error("JSON Parse Error:", error);
            // console.log("Problematic Response:", feedbackText);

            setStatusText("AI returned invalid JSON. Check console.");
            return;
        }



        //----------
        // console.log("Parsed Feedback:", data.feedback);
        //----------



        await kv.set(`resume:${uuid}`, JSON.stringify(data));

        // here
        // console.log("UUID:", uuid);
        // console.log("Navigate to:", `/resume/${uuid}`);

        // const saved = await kv.get(`resume:${uuid}`);
        // console.log("Saved data exists:", saved);
        //--------------------------------------------------




        setStatusText('Analysis complete! Redirecting to results...');

        console.log(data);
        navigate(`/resume/${uuid}`);

    };

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget.closest('form');
        if (!form) return;

        const formData = new FormData(form);
        const companyName = formData.get('company-name') as string;
        const jobTitle = formData.get('job-title') as string;
        const jobDescription = formData.get('job-description') as string;

        if (!file) {
            alert('Please upload a resume file.');
            return;
        }

        handleAnalyzer({ companyName, jobTitle, jobDescription, file });
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
                                <FileUploader onFileSelect={handleFileSelect} />

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