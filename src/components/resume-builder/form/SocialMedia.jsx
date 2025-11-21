import FormButton from "@/components/resume-builder/form/FormButton";
import React, { useContext, useState, useEffect } from "react";
import { ResumeContext } from "@/app/resume/edit/ResumeContext";
import {
  MdDelete,
  MdCheckCircle,
  MdCancel,
  MdLink,
  MdLinkOff,
} from "react-icons/md";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

const SocialMedia = () => {
  const { resumeData, setResumeData } = useContext(ResumeContext);
  const [validationStatus, setValidationStatus] = useState({});

  // Validate URL
  const validateUrl = async (url, index) => {
    if (!url || url.trim() === "") {
      setValidationStatus((prev) => ({ ...prev, [index]: "empty" }));
      return;
    }

    setValidationStatus((prev) => ({ ...prev, [index]: "checking" }));

    try {
      const fullUrl = url.startsWith("http") ? url : `https://${url}`;
      const response = await fetch(fullUrl, {
        method: "HEAD",
        mode: "no-cors",
        cache: "no-cache",
      });

      // With no-cors mode, we can't check status, but if fetch succeeds, URL is likely valid
      setValidationStatus((prev) => ({ ...prev, [index]: "valid" }));
    } catch (error) {
      setValidationStatus((prev) => ({ ...prev, [index]: "invalid" }));
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
        setValidationStatus((prev) => ({ ...prev, [index]: "empty" }));
      }
    });

    return () => {
      Object.values(timeouts).forEach((timeout) => clearTimeout(timeout));
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
      setValidationStatus((prev) => ({ ...prev, [index]: "empty" }));
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
    setValidationStatus((prev) => {
      const newStatus = {};
      Object.keys(prev).forEach((key) => {
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
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <div className="w-1 h-6 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></div>
        <h2 className="text-lg text-white font-semibold">Social Media</h2>
      </div>
      <div className="flex flex-col gap-3">
        {resumeData.socialMedia.map((socialMedia, index) => {
          const status = validationStatus[index] || "empty";
          const getStatusIcon = () => {
            switch (status) {
              case "valid":
                return (
                  <MdCheckCircle
                    className="text-xl text-green-400"
                    title="URL is valid and reachable"
                  />
                );
              case "invalid":
                return (
                  <MdLinkOff
                    className="text-xl text-red-400"
                    title="URL is invalid or unreachable"
                  />
                );
              case "checking":
                return (
                  <AiOutlineLoading3Quarters
                    className="text-xl text-blue-400 animate-spin"
                    title="Validating URL..."
                  />
                );
              case "empty":
              default:
                return (
                  <MdLink
                    className="text-xl text-white/30"
                    title="Enter a URL to validate"
                  />
                );
            }
          };

          return (
            <div
              key={index}
              className="group flex flex-col sm:flex-row items-stretch sm:items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-lg hover:border-white/20 hover:bg-white/10 transition-all"
            >
              <div className="flex items-center gap-3 flex-1">
                <div className="flex-shrink-0 flex items-center">
                  {getStatusIcon()}
                </div>
                <input
                  type="text"
                  placeholder="Platform Name"
                  name="socialMedia"
                  className="flex-1 px-3 py-2 bg-white/10 text-white rounded-lg text-sm border border-white/20 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 outline-none transition-all placeholder:text-white/40"
                  value={socialMedia.socialMedia}
                  onChange={(e) => handleSocialMedia(e, index)}
                />
              </div>
              <div className="flex items-center gap-3 flex-1">
                <input
                  type="text"
                  placeholder="URL"
                  name="link"
                  className="flex-1 px-3 py-2 bg-white/10 text-white rounded-lg text-sm border border-white/20 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 outline-none transition-all placeholder:text-white/40"
                  value={socialMedia.link}
                  onChange={(e) => handleSocialMedia(e, index)}
                />
                <button
                  type="button"
                  onClick={() => deleteSocialMedia(index)}
                  className="flex-shrink-0 p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-all"
                  title="Delete this social media"
                >
                  <MdDelete className="text-xl" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
      <FormButton
        size={resumeData.socialMedia.length}
        add={addSocialMedia}
        label="Social Media"
      />
    </div>
  );
};

export default SocialMedia;
