import FormButton from "@/components/resume-builder/form/FormButton";
import React, { useContext, useState, useEffect } from "react";
import { ResumeContext } from "@/app/resume/edit/ResumeContext";
import { MdDelete, MdCheckCircle, MdCancel, MdLink, MdLinkOff } from "react-icons/md";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

const SocialMedia = () => {
  const { resumeData, setResumeData } = useContext(ResumeContext);
  const [validationStatus, setValidationStatus] = useState({});

  // Validate URL
  const validateUrl = async (url, index) => {
    if (!url || url.trim() === "") {
      setValidationStatus(prev => ({ ...prev, [index]: "empty" }));
      return;
    }

    setValidationStatus(prev => ({ ...prev, [index]: "checking" }));

    try {
      const fullUrl = url.startsWith("http") ? url : `https://${url}`;
      const response = await fetch(fullUrl, {
        method: "HEAD",
        mode: "no-cors",
        cache: "no-cache"
      });

      // With no-cors mode, we can't check status, but if fetch succeeds, URL is likely valid
      setValidationStatus(prev => ({ ...prev, [index]: "valid" }));
    } catch (error) {
      setValidationStatus(prev => ({ ...prev, [index]: "invalid" }));
    }
  };

  // Debounce URL validation
  useEffect(() => {
    const timeouts = {};
    resumeData.socialMedia.forEach((socialMedia, index) => {
      if (socialMedia.link) {
        timeouts[index] = setTimeout(() => {
          validateUrl(socialMedia.link, index);
        }, 1000);
      } else {
        setValidationStatus(prev => ({ ...prev, [index]: "empty" }));
      }
    });

    return () => {
      Object.values(timeouts).forEach(timeout => clearTimeout(timeout));
    };
  }, [resumeData.socialMedia]);

  // social media
  const handleSocialMedia = (e, index) => {
    const newSocialMedia = [...resumeData.socialMedia];
    newSocialMedia[index][e.target.name] = e.target.value.replace(
      "https://",
      ""
    );
    setResumeData({ ...resumeData, socialMedia: newSocialMedia });

    // Clear validation status if link field is cleared
    if (e.target.name === "link" && e.target.value.trim() === "") {
      setValidationStatus(prev => ({ ...prev, [index]: "empty" }));
    }
  };

  const addSocialMedia = () => {
    setResumeData({
      ...resumeData,
      socialMedia: [...resumeData.socialMedia, { socialMedia: "", link: "" }],
    });
  };

  const removeSocialMedia = (index) => {
    const newSocialMedia = [...resumeData.socialMedia];
    newSocialMedia[index] = newSocialMedia[newSocialMedia.length - 1];
    newSocialMedia.pop();
    setResumeData({ ...resumeData, socialMedia: newSocialMedia });
  };

  const deleteSocialMedia = (index) => {
    const newSocialMedia = resumeData.socialMedia.filter((_, i) => i !== index);
    setResumeData({ ...resumeData, socialMedia: newSocialMedia });

    // Remove validation status for deleted item and reindex remaining items
    setValidationStatus(prev => {
      const newStatus = {};
      Object.keys(prev).forEach(key => {
        const keyIndex = parseInt(key);
        if (keyIndex < index) {
          newStatus[keyIndex] = prev[keyIndex];
        } else if (keyIndex > index) {
          newStatus[keyIndex - 1] = prev[keyIndex];
        }
      });
      return newStatus;
    });
  };

  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-base text-white font-semibold">Social Media</h2>
      {resumeData.socialMedia.map((socialMedia, index) => {
        const status = validationStatus[index] || "empty";
        const getStatusIcon = () => {
          switch (status) {
            case "valid":
              return <MdCheckCircle className="text-xl text-green-500" title="URL is valid and reachable" />;
            case "invalid":
              return <MdLinkOff className="text-xl text-red-500" title="URL is invalid or unreachable" />;
            case "checking":
              return <AiOutlineLoading3Quarters className="text-xl text-blue-400 animate-spin" title="Validating URL..." />;
            case "empty":
            default:
              return <MdLink className="text-xl text-gray-400" title="Enter a URL to validate" />;
          }
        };

        return (
          <div key={index} className="flex items-center gap-2 hover:bg-blue-900/20 rounded px-2 py-1 -mx-2 -my-1 transition-colors">
            <div className="flex-shrink-0 flex items-center">
              {getStatusIcon()}
            </div>
            <input
              type="text"
              placeholder="Social Media"
              name="socialMedia"
              className="flex-1 min-w-0 px-2 py-1 bg-white text-gray-950 rounded"
              value={socialMedia.socialMedia}
              onChange={(e) => handleSocialMedia(e, index)}
            />
            <input
              type="text"
              placeholder="Link"
              name="link"
              className="flex-1 min-w-0 px-2 py-1 bg-white text-gray-950 rounded"
              value={socialMedia.link}
              onChange={(e) => handleSocialMedia(e, index)}
            />
            <button
              type="button"
              onClick={() => deleteSocialMedia(index)}
              className="flex-shrink-0 p-1 text-[deepskyblue] hover:opacity-70 rounded transition-opacity flex items-center"
              title="Delete this social media"
            >
              <MdDelete className="text-xl" />
            </button>
          </div>
        );
      })}
      <FormButton
        size={resumeData.socialMedia.length}
        add={addSocialMedia}
        label="Social Media"
      />
    </div>
  );
};

export default SocialMedia;
