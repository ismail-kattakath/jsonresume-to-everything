import React, { useContext } from 'react'
import { ResumeContext } from '@/lib/contexts/DocumentContext'

interface ContactInfoProps {
  mainclass?: string
  linkclass?: string
  teldata?: string
  emaildata?: string
  addressdata?: string
  telicon?: React.ReactNode
  emailicon?: React.ReactNode
  addressicon?: React.ReactNode
}

const ContactInfo = ({
  mainclass = '',
  linkclass = '',
  teldata = '',
  emaildata = '',
  addressdata = '',
  telicon,
  emailicon,
  addressicon,
}: ContactInfoProps) => {
  const {
    resumeData,
    setResumeData,
    editable = true,
  } = useContext(ResumeContext)

  // Helper function to strip formatting from phone number for tel: link
  const getCleanPhoneNumber = (phone: string) => {
    return phone.replace(/[\s\-\(\)]/g, '')
  }

  const handlePhoneBlur = (e: React.FocusEvent<HTMLAnchorElement>) => {
    setResumeData({
      ...resumeData,
      contactInformation: e.currentTarget.innerText,
    })
  }

  const handleEmailBlur = (e: React.FocusEvent<HTMLAnchorElement>) => {
    setResumeData({ ...resumeData, email: e.currentTarget.innerText })
  }

  const handleAddressBlur = (e: React.FocusEvent<HTMLAnchorElement>) => {
    setResumeData({ ...resumeData, address: e.currentTarget.innerText })
  }

  return (
    <div className={mainclass}>
      {teldata && teldata.trim() !== '' && (
        <a
          className={`${linkclass} editable`}
          aria-label="Phone Number"
          href={`tel:${getCleanPhoneNumber(teldata)}`}
          contentEditable={editable}
          suppressContentEditableWarning
          onBlur={handlePhoneBlur}
        >
          {telicon} {teldata}
        </a>
      )}
      {emaildata && emaildata.trim() !== '' && (
        <a
          className={`${linkclass} editable`}
          aria-label="Email Address"
          href={`mailto:${emaildata}`}
          contentEditable={editable}
          suppressContentEditableWarning
          onBlur={handleEmailBlur}
        >
          {emailicon} {emaildata}
        </a>
      )}
      {addressdata && addressdata.trim() !== '' && (
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressdata)}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Address"
          className={`${linkclass} editable`}
          contentEditable={editable}
          suppressContentEditableWarning
          onBlur={handleAddressBlur}
        >
          {addressicon} {addressdata}
        </a>
      )}
    </div>
  )
}

export default ContactInfo
