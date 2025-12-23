import React, { useState } from 'react';
import { ChevronRight, ChevronDown, File, Folder } from 'lucide-react';

const FileTreeItem = ({ item, onFileClick, level = 0 }) => {
  const [isOpen, setIsOpen] = useState(false);
  const isFolder = item.type === 'folder';

  const handleClick = () => {
    if (isFolder) {
      setIsOpen(!isOpen);
    } else {
      onFileClick(item);
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

const FileExplorer = ({ fileTree, onFileClick }) => {
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