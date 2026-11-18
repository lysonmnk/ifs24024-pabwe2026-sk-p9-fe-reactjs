import React, { useEffect, useRef } from 'react'
import Editor from '@toast-ui/editor'

export const MarkdownViewer = ({ content = '' }) => {
  const containerRef = useRef(null)
  const viewerRef = useRef(null)

  useEffect(() => {
    const viewer = Editor.factory({
      el: containerRef.current,
      viewer: true,
      initialValue: content,
    })

    viewerRef.current = viewer

    return () => {
      viewer.destroy()
      viewerRef.current = null
    }
  }, [])

  useEffect(() => {
    if (viewerRef.current && content !== undefined) {
      viewerRef.current.setMarkdown(content)
    }
  }, [content])

  return <div ref={containerRef} className="toastui-viewer-wrapper w-full" data-testid="markdown-viewer" />
}

export default MarkdownViewer
