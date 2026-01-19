#!/bin/bash
# Script to batch fix Jasmine to Jest conversions
# Run from the viewer app directory

echo "Fixing Jasmine to Jest conversions..."

# Find all spec files
find src -name "*.spec.ts" -type f | while read file; do
  echo "Processing $file..."
  
  # Replace jasmine.SpyObj with jest.Mocked
  sed -i '' 's/jasmine\.SpyObj</jest.Mocked</g' "$file"
  
  # Replace jasmine.stringContaining with expect.stringContaining
  sed -i '' 's/jasmine\.stringContaining(/expect.stringContaining(/g' "$file"
  
  # Replace standalone spyOn with jest.spyOn (be careful - only if not already jest.spyOn)
  sed -i '' 's/\bspyOn(/jest.spyOn(/g' "$file"
  
  # Replace .and.returnValue with .mockReturnValue
  sed -i '' 's/\.and\.returnValue(/\.mockReturnValue(/g' "$file"
  
  # Replace .and.callThrough with .mockImplementation (requires manual review)
  # sed -i '' 's/\.and\.callThrough()/\.mockImplementation((...args) => original(...args))/g' "$file"
  
  # Replace expectAsync().toBeResolved() with expect().resolves.toBeDefined()
  sed -i '' 's/expectAsync(\([^)]*\))\.toBeResolved()/expect(\1).resolves.toBeDefined()/g' "$file"
  
  # Replace expectAsync().toBeRejected() with expect().rejects.toThrow()
  sed -i '' 's/expectAsync(\([^)]*\))\.toBeRejected()/expect(\1).rejects.toThrow()/g' "$file"
done

echo "Done! Note: jasmine.createSpyObj needs manual replacement with object literals."
