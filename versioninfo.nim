## Generates a version whenever called with --inc argument

when isMainModule:
    # Maj / Minor / Milestone
    const version = (
        1, 1, 0
    )

    # Imports
    import os, strutils, parseopt2

    # Fields
    const version_file = "version.info"

    # Parse --inc
    var parser    = initOptParser(); parser.next()
    var increment = parser.key == "inc"

    ## Open versioninfo file, increment version, and save it
    var rev = 0

    if increment and not existsFile(version_file):
        writeFile(version_file, $rev)

    # Read and increment version
    rev = parseInt(readFile(version_file)) + 1

    if increment:
        if rev > 9999: #Raise max exception
            os.removeFile(version_file) # Delete the file so it rolls over
            raise newException(EIO, "Build revision has exceeded 9999")

        # Write file
        writeFile(version_file, $rev)

    # Output version
    stdout.write(
        $version[0] & "." & $version[1] & "." & $version[2] & "." & $rev
    )

else:
    when defined(windows):
        const build* = staticExec("versioninfo --inc")
    else:
        const build* = staticExec("./versioninfo --inc")