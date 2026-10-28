interface XRHitTestSource { cancel?(): void }
interface XRHitTestResult { getPose(space: XRReferenceSpace): { transform: {matrix: Float32Array}} | null }
interface XRFrame { getHitTestResults(source: XRHitTestSource): XRHitTestResult[] }
interface XRSession { requestHitTestSource?(options:{space: XRReferenceSpace}): Promise<XRHitTestSource> }
