#!/bin/bash
# AdminPlus Build Timestamp Updater
# This script updates the buildTimestamp in version.js with the current Eastern Time

VERSION_FILE="version.js"

# Get current timestamp in Eastern Time (automatically handles EST/EDT)
TIMESTAMP=$(TZ="America/New_York" date +"%Y-%m-%d %I:%M:%S %p %Z")

# Check if version.js exists
if [ ! -f "$VERSION_FILE" ]; then
    echo "Error: $VERSION_FILE not found!"
    exit 1
fi

# Update the buildTimestamp line
sed -i.bak "s/buildTimestamp: \".*\"/buildTimestamp: \"$TIMESTAMP\"/" "$VERSION_FILE"

# Update the comment line as well
sed -i.bak "s/\/\/ Last Updated: .*/\/\/ Last Updated: $TIMESTAMP/" "$VERSION_FILE"

# Remove backup file
rm -f "${VERSION_FILE}.bak"

echo "✅ Build timestamp updated to: $TIMESTAMP"
echo "📝 File updated: $VERSION_FILE"
echo ""
echo "💡 Tip: To disable build info for production, set SHOW_BUILD_INFO = false in version.js"

