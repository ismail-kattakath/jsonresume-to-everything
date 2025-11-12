import React, { useContext } from "react";
import { ResumeContext } from "@/app/resume/edit/ResumeContext";

const ContactInfo = ({ mainclass, linkclass, teldata, emaildata, addressdata, telicon, emailicon, addressicon }) => {
    const { resumeData, setResumeData } = useContext(ResumeContext);

    // Helper function to strip formatting from phone number for tel: link
    const getCleanPhoneNumber = (phone) => {
      return phone.replace(/[\s\-\(\)]/g, '');
    };

    const handlePhoneBlur = (e) => {
      setResumeData({ ...resumeData, contactInformation: e.target.innerText });
    };

    const handleEmailBlur = (e) => {
      setResumeData({ ...resumeData, email: e.target.innerText });
    };

    const handleAddressBlur = (e) => {
      setResumeData({ ...resumeData, address: e.target.innerText });
    };

    return (
      <div className={mainclass}>
        {teldata && teldata.trim() !== "" && (
          <a className={`${linkclass} editable`}
            aria-label="Phone Number"
            href={`tel:${getCleanPhoneNumber(teldata)}`}
            contentEditable
            suppressContentEditableWarning
            onBlur={handlePhoneBlur}>
            {telicon}  {teldata}
          </a>
        )}
        {emaildata && emaildata.trim() !== "" && (
          <a className={`${linkclass} editable`}
            aria-label="Email Address"
            href={`mailto:${emaildata}`}
            contentEditable
            suppressContentEditableWarning
            onBlur={handleEmailBlur}>
            {emailicon} {emaildata}
          </a>
        )}
        {addressdata && addressdata.trim() !== "" && (
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressdata)}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Address"
            className={`${linkclass} editable`}
            contentEditable
            suppressContentEditableWarning
            onBlur={handleAddressBlur}>
            {addressicon} {addressdata}
          </a>
        )}
      </div>
    );
  }

export default ContactInfo;