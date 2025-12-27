import React, { useEffect, useState } from 'react';
import { ChevronRight, ChevronDown, File, Folder } from 'lucide-react';

const FileTreeItem = ({ item, onFileClick, level = 0 }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [children, setChildren] = useState(item.children || []);
  const [isLoading, setIsLoading] = useState(false);
  const isFolder = item.type === 'folder';

  const handleToggle = async () => {
    if (item.type === 'folder') {
      if (!isExpanded && children.length === 0) {
        // Load children from file system
        setIsLoading(true);
        try {
          const result = await window.api.readDirectory(item.path);
          if (result.success) {
            setChildren(result.files);
          }
        } catch (error) {
          console.error('Error loading directory:', error);
        }
        setIsLoading(false);
      }
      setIsExpanded(!isExpanded);
    }
  };

  const handleClick = async () => {
    if (isFolder === false) {
      try {
        const result = await window.api.readFile(item.path);
        if (result.success) {
          onFileClick({ ...item, content: result.content });
        }
      } catch (error) {
        console.error('Error reading file:', error);
      }
    } else {
      handleToggle();
    }
  };

  return (
    <div>
      <div
        onClick={handleClick}
        style={{
          paddingLeft: `${level * 20 + 10}px`,
          padding: '5px 10px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '5px'
        }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f0f0'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
      >
        {isFolder && (
          isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />
        )}
        {isFolder ? <Folder size={16} /> : <File size={16} />}
        <span>{item.name}</span>
      </div>
      {isFolder && isOpen && item.children && (
        <div>
          {item.children.map((child, index) => (
            <FileTreeItem
              key={index}
              item={child}
              onFileClick={onFileClick}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const FileExplorer = ({ initialPath, onFileClick }) => {
  const [fileTree, setFileTree] = useState([]);
  const [currentPath, setCurrentPath] = useState(initialPath || '');

  useEffect(() => {
    const loadInitialDirectory = async () => {
      try {
        let pathToLoad = currentPath;
        if (!pathToLoad) {
          const homeResult = await window.api.getHomePath();
          pathToLoad = homeResult;
        }
        
        const result = await window.api.readDirectory(pathToLoad);
        if (result.success) {
          setFileTree(result.files);
          setCurrentPath(pathToLoad);
        }
      } catch (error) {
        console.error('Error loading initial directory:', error);
      }
    };

    loadInitialDirectory();
  }, [initialPath]);

  return (
    <div style={{
      width: '250px',
      height: '100vh',
      borderRight: '1px solid #ccc',
      overflowY: 'auto',
      backgroundColor: '#fafafa'
    }}>
      <div style={{ padding: '10px', fontWeight: 'bold', borderBottom: '1px solid #ccc' }}>
        Explorer
      </div>
      {fileTree.map((item, index) => (
        <FileTreeItem key={index} item={item} onFileClick={onFileClick} />
      ))}
    </div>
  );
};

export { FileExplorer, FileTreeItem };