import {
  FaGithub,
  FaLinkedin,
  FaTwitter,
  FaFacebook,
  FaInstagram,
  FaYoutube,
  FaGlobe,
} from "react-icons/fa";
import { MdEmail, MdLocationOn, MdPhone } from "react-icons/md";
import ContactInfo from "@/components/resume-builder/preview/ContactInfo";
import { formatUrl } from "@/components/resume-builder/utility/formatUrl";
import Image from "next/image";
import React, { useContext } from "react";
import { ResumeContext } from "@/app/resume/edit/ResumeContext";

const CoverLetterPreview = () => {
  const { resumeData, setResumeData } = useContext(ResumeContext);

  const icons = [
    { name: "github", icon: <FaGithub /> },
    { name: "linkedin", icon: <FaLinkedin /> },
    { name: "twitter", icon: <FaTwitter /> },
    { name: "facebook", icon: <FaFacebook /> },
    { name: "instagram", icon: <FaInstagram /> },
    { name: "youtube", icon: <FaYoutube /> },
    { name: "website", icon: <FaGlobe /> },
  ];

  return (
    <div className="w-full md:w-[8.5in] absolute -z-10 md:sticky md:z-10 md:top-0 preview rm-padding-print p-6 md:overflow-y-scroll md:h-screen bg-white text-black font-[sans-serif]">
      <div className="flex flex-col items-center mb-2 pb-1 border-b-2 border-gray-300 border-dashed">
        {resumeData.profilePicture && resumeData.profilePicture.length > 0 && (
          <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-[black]">
            <Image
              src={resumeData.profilePicture}
              alt="profile"
              width={100}
              height={100}
              className="object-cover h-full w-full"
            />
          </div>
        )}
        <h1 className="name editable" contentEditable suppressContentEditableWarning>
          {resumeData.name}
        </h1>
        <h2 className="profession editable" contentEditable suppressContentEditableWarning>
          {resumeData.position}
        </h2>
        <ContactInfo
          mainclass="flex flex-row gap-1 mb-1 contact"
          linkclass="inline-flex items-center gap-1"
          teldata={resumeData.contactInformation}
          emaildata={resumeData.email}
          addressdata={resumeData.address}
          telicon={<MdPhone />}
          emailicon={<MdEmail />}
          addressicon={<MdLocationOn />}
        />
        <div className="grid grid-cols-3 gap-1">
          {resumeData.socialMedia && resumeData.socialMedia.map((socialMedia, index) => {
            const handleSocialMediaBlur = (e) => {
              const newSocialMedia = [...resumeData.socialMedia];
              newSocialMedia[index].link = e.target.innerText;
              setResumeData({ ...resumeData, socialMedia: newSocialMedia });
            };

            return (
              <a
                href={formatUrl(socialMedia.link)}
                aria-label={socialMedia.socialMedia}
                key={index}
                title={socialMedia.socialMedia}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 content align-center justify-center text-blue-700 hover:underline editable"
                contentEditable
                suppressContentEditableWarning
                onBlur={handleSocialMediaBlur}
              >
                {icons.map((icon, iconIndex) => {
                  if (icon.name === socialMedia.socialMedia.toLowerCase()) {
                    return <span key={iconIndex}>{icon.icon}</span>;
                  }
                })}
                {socialMedia.link}
              </a>
            );
          })}
        </div>
      </div>

      {/* Cover Letter Content */}
      <div className="mt-4">
        <p className="content mb-2">Dear Hiring Manager,</p>
        <p className="content whitespace-pre-wrap editable" contentEditable suppressContentEditableWarning>
          {resumeData.content}
        </p>
      </div>
    </div>
  );
};

export default CoverLetterPreview;
