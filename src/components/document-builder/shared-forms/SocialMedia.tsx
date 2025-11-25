import FormButton from '@/components/resume-builder/form/FormButton'
import React, { useContext, useState, useEffect } from 'react'
import { ResumeContext } from '@/lib/contexts/DocumentContext'
import {
  MdDelete,
  MdCheckCircle,
  MdLink,
  MdLinkOff,
} from 'react-icons/md'
import { AiOutlineLoading3Quarters } from 'react-icons/ai'

const SocialMedia = () => {
  const { resumeData, setResumeData } = useContext(ResumeContext)
  const [validationStatus, setValidationStatus] = useState({})

  // Validate URL
  const validateUrl = async (url, index) => {
    if (!url || url.trim() === '') {
      setValidationStatus((prev) => ({ ...prev, [index]: 'empty' }))
      return
    }

    setValidationStatus((prev) => ({ ...prev, [index]: 'checking' }))

    try {
      const fullUrl = url.startsWith('http') ? url : `https://${url}`
      await fetch(fullUrl, {
        method: 'HEAD',
        mode: 'no-cors',
        cache: 'no-cache',
      })

      // With no-cors mode, we can't check status, but if fetch succeeds, URL is likely valid
      setValidationStatus((prev) => ({ ...prev, [index]: 'valid' }))
    } catch {
      setValidationStatus((prev) => ({ ...prev, [index]: 'invalid' }))
    }
  }

  // Debounce URL validation
  useEffect(() => {
    const timeouts = {}
    resumeData.socialMedia.forEach((socialMedia, index) => {
      if (socialMedia.link) {
        timeouts[index] = setTimeout(() => {
          validateUrl(socialMedia.link, index)
        }, 1000)
      } else {
        setValidationStatus((prev) => ({ ...prev, [index]: 'empty' }))
      }
    })

    return () => {
      Object.values(timeouts).forEach((timeout) => clearTimeout(timeout))
    }
  }, [resumeData.socialMedia])

  // social media
  const handleSocialMedia = (e, index) => {
    const newSocialMedia = [...resumeData.socialMedia]
    newSocialMedia[index][e.target.name] = e.target.value.replace(
      'https://',
      ''
    )
    setResumeData({ ...resumeData, socialMedia: newSocialMedia })

    // Clear validation status if link field is cleared
    if (e.target.name === 'link' && e.target.value.trim() === '') {
      setValidationStatus((prev) => ({ ...prev, [index]: 'empty' }))
    }
  }

  const addSocialMedia = () => {
    setResumeData({
      ...resumeData,
      socialMedia: [...resumeData.socialMedia, { socialMedia: '', link: '' }],
    })
  }

  const deleteSocialMedia = (index) => {
    const newSocialMedia = resumeData.socialMedia.filter((_, i) => i !== index)
    setResumeData({ ...resumeData, socialMedia: newSocialMedia })

    // Remove validation status for deleted item and reindex remaining items
    setValidationStatus((prev) => {
      const newStatus = {}
      Object.keys(prev).forEach((key) => {
        const keyIndex = parseInt(key)
        if (keyIndex < index) {
          newStatus[keyIndex] = prev[keyIndex]
        } else if (keyIndex > index) {
          newStatus[keyIndex - 1] = prev[keyIndex]
        }
      })
      return newStatus
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <div className="h-6 w-1 rounded-full bg-gradient-to-b from-purple-500 to-pink-500"></div>
        <h2 className="text-lg font-semibold text-white">Social Media</h2>
      </div>
      <div className="flex flex-col gap-3">
        {resumeData.socialMedia.map((socialMedia, index) => {
          const status = validationStatus[index] || 'empty'
          const getStatusIcon = () => {
            switch (status) {
              case 'valid':
                return (
                  <MdCheckCircle
                    className="text-xl text-green-400"
                    title="URL is valid and reachable"
                  />
                )
              case 'invalid':
                return (
                  <MdLinkOff
                    className="text-xl text-red-400"
                    title="URL is invalid or unreachable"
                  />
                )
              case 'checking':
                return (
                  <AiOutlineLoading3Quarters
                    className="animate-spin text-xl text-blue-400"
                    title="Validating URL..."
                  />
                )
              case 'empty':
              default:
                return (
                  <MdLink
                    className="text-xl text-white/30"
                    title="Enter a URL to validate"
                  />
                )
            }
          }

          return (
            <div
              key={index}
              className="group flex flex-col items-stretch gap-3 rounded-lg border border-white/10 bg-white/5 p-3 transition-all hover:border-white/20 hover:bg-white/10 sm:flex-row sm:items-center"
            >
              <div className="flex flex-1 items-center gap-3">
                <div className="flex flex-shrink-0 items-center">
                  {getStatusIcon()}
                </div>
                <div className="floating-label-group flex-1">
                  <input
                    type="text"
                    placeholder="Platform Name"
                    name="socialMedia"
                    className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white transition-all outline-none placeholder:text-white/40 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20"
                    value={socialMedia.socialMedia}
                    onChange={(e) => handleSocialMedia(e, index)}
                  />
                  <label className="floating-label">Platform Name</label>
                </div>
              </div>
              <div className="flex flex-1 items-center gap-3">
                <div className="floating-label-group flex-1">
                  <input
                    type="text"
                    placeholder="URL"
                    name="link"
                    className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white transition-all outline-none placeholder:text-white/40 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20"
                    value={socialMedia.link}
                    onChange={(e) => handleSocialMedia(e, index)}
                  />
                  <label className="floating-label">URL</label>
                </div>
                <button
                  type="button"
                  onClick={() => deleteSocialMedia(index)}
                  className="flex-shrink-0 cursor-pointer rounded-lg p-2 text-red-400 transition-all hover:bg-red-400/10 hover:text-red-300"
                  title="Delete this social media"
                >
                  <MdDelete className="text-xl" />
                </button>
              </div>
            </div>
          )
        })}
      </div>
      <FormButton
        size={resumeData.socialMedia.length}
        add={addSocialMedia}
        label="Social Media"
      />
    </div>
  )
}

export default SocialMedia
