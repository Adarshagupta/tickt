export function Loading() {
  return (
    <div className="fixed inset-0 bg-gray-50/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="relative">
        <div className="absolute -inset-4">
          <div className="w-full h-full mx-auto rotate-180">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-violet-500 blur-lg opacity-20" />
          </div>
        </div>
        <div className="relative">
          <div className="flex flex-col items-center gap-2">
            <div className="flex space-x-1.5">
              <div className="h-3 w-3 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 animate-[bounce_1s_infinite_100ms]" />
              <div className="h-3 w-3 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 animate-[bounce_1s_infinite_200ms]" />
              <div className="h-3 w-3 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 animate-[bounce_1s_infinite_300ms]" />
            </div>
            <div className="text-sm font-medium text-indigo-950">Loading...</div>
          </div>
        </div>
      </div>
    </div>
  )
} 