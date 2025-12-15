import React, { useEffect, useState, useRef } from 'react';

const ProductModal = ({ product, onClose, isEditable, onSave, onDelete }) => {
    const [editedProduct, setEditedProduct] = useState(product);
    const [showImageMenu, setShowImageMenu] = useState(false);
    const nameInputRef = useRef(null);
    const descriptionRef = useRef(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        setEditedProduct(product);
    }, [product]);

    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        document.body.style.overflow = 'hidden';

        // Auto-focus name if editable
        if (isEditable && nameInputRef.current) {
            nameInputRef.current.focus();
            nameInputRef.current.select();
        }

        return () => {
            window.removeEventListener('keydown', handleEsc);
            document.body.style.overflow = 'unset';
        };
    }, [onClose, isEditable]); // Run focus logic when openness updates

    const handleChange = (field, value) => {
        const newer = { ...editedProduct, [field]: value };
        setEditedProduct(newer);
        onSave(newer);
    };

    const handleNameKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (descriptionRef.current) {
                // Focus and place cursor at end (or select all? prompt said "selected so that i start typing directly")
                descriptionRef.current.focus();
                // descriptionRef.current.select(); // User said "Description (selected so that i start typing directly)"
            }
        }
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                handleChange('image', event.target.result);
                setShowImageMenu(false);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleImageMenuAction = (action) => {
        if (action === 'upload') {
            fileInputRef.current.click();
        } else if (action === 'copy') {
            // Copy logic
            alert("Copy image not implemented (requires HTTPS/Blob).");
        } else if (action === 'download') {
            const link = document.createElement('a');
            link.href = editedProduct.image;
            link.download = `product_${editedProduct.id}.png`;
            link.click();
        } else if (action === 'shop') {
            window.open(`https://google.com/search?q=buy+${editedProduct.name}`, '_blank');
        }
        if (action !== 'upload') setShowImageMenu(false);
    };

    if (!product) return null;

    return (
        <div
            onClick={onClose}
            style={{
                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                backgroundColor: 'rgba(255, 255, 255, 0.98)',
                zIndex: 1000,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                opacity: 1, transition: 'opacity 0.2s ease',
                cursor: 'pointer' // Indicate clickable
            }}
        >
            <div
                // Clicking the white container ALSO closes, unless stopPropagation is called on children
                onClick={onClose}
                className='modal-content-wrapper'
                style={{
                    width: '100%', maxWidth: '1200px', height: '90vh',
                    display: 'grid', gridTemplateColumns: '1.5fr 1fr',
                    gap: '4rem', padding: '2rem',
                    cursor: 'default'
                }}
            >
                {/* Image Section */}
                <div
                    onClick={(e) => e.stopPropagation()} // Stop closing when clicking image area
                    style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative',
                        height: '100%'
                    }}
                >
                    <img
                        src={editedProduct.image}
                        alt={editedProduct.name}
                        onClick={() => isEditable && setShowImageMenu(!showImageMenu)}
                        style={{
                            maxWidth: '100%', maxHeight: '100%', objectFit: 'contain',
                            cursor: isEditable ? 'pointer' : 'default'
                        }}
                        onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }}
                    />
                    <div style={{ display: 'none', position: 'absolute' }}>Image Load Failed</div>

                    {/* Image Menu Overlay */}
                    {isEditable && showImageMenu && (
                        <div style={{
                            position: 'absolute',
                            backgroundColor: 'white',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                            borderRadius: '8px',
                            padding: '10px',
                            display: 'flex', flexDirection: 'column', gap: '8px',
                            zIndex: 10
                        }}>
                            <button onClick={() => handleImageMenuAction('upload')}>Upload from computer</button>
                            <button onClick={() => handleImageMenuAction('copy')}>Copy image</button>
                            <button onClick={() => handleImageMenuAction('download')}>Download image</button>
                            <button onClick={() => handleImageMenuAction('shop')}>Shop</button>
                            <input
                                type="file"
                                ref={fileInputRef}
                                style={{ display: 'none' }}
                                onChange={handleImageUpload}
                                accept="image/*"
                            />
                        </div>
                    )}
                </div>

                {/* Text/Inputs Section */}
                <div
                    onClick={(e) => e.stopPropagation()} // Stop closing when clicking text area
                    style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingRight: '2rem' }}
                >
                    {isEditable ? (
                        <>
                            <input
                                ref={nameInputRef}
                                value={editedProduct.name}
                                onChange={(e) => handleChange('name', e.target.value)}
                                onKeyDown={handleNameKeyDown}
                                style={{
                                    fontSize: '2rem', marginBottom: '1rem', fontWeight: 600,
                                    border: 'none', background: 'transparent', outline: 'none',
                                    width: '100%', padding: 0
                                }}
                                placeholder="Product Name"
                            />
                            <textarea
                                ref={descriptionRef}
                                value={editedProduct.description}
                                onChange={(e) => handleChange('description', e.target.value)}
                                style={{
                                    fontSize: '1.1rem', lineHeight: 1.6, color: '#444',
                                    height: '200px', border: 'none', background: 'transparent', outline: 'none',
                                    resize: 'none', width: '100%', fontFamily: 'inherit', padding: 0
                                }}
                                placeholder="Description"
                            />
                            <input
                                value={editedProduct.sponsoredLink || ''}
                                onChange={(e) => handleChange('sponsoredLink', e.target.value)}
                                style={{
                                    fontSize: '0.9rem', color: '#666',
                                    marginTop: '1rem',
                                    border: 'none', background: 'transparent', outline: 'none',
                                    width: '100%', padding: 0, fontStyle: 'italic'
                                }}
                                placeholder="Add a sponsored link..."
                            />
                        </>
                    ) : (
                        <>
                            <h2 style={{ fontSize: '2rem', marginBottom: '1rem', fontWeight: 600 }}>{product.name}</h2>
                            <p style={{ fontSize: '1.1rem', lineHeight: 1.6, color: '#444' }}>
                                {product.description}
                            </p>
                            {product.sponsoredLink && (
                                <a
                                    href={product.sponsoredLink}
                                    target="_blank"
                                    rel="noreferrer"
                                    style={{ marginTop: '1rem', color: '#888', textDecoration: 'none', fontSize: '0.9rem' }}
                                >
                                    Shop Link ↗
                                </a>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Fixed Bottom Right Delete Button */}
            {isEditable && (
                <div style={{
                    position: 'fixed',
                    bottom: '20px',
                    right: '20px',
                    zIndex: 1100
                }}>
                    <span
                        onClick={(e) => {
                            e.stopPropagation();
                            if (onDelete(product.id)) onClose();
                        }}
                        style={{
                            fontSize: '0.8rem', color: '#999',
                            cursor: 'pointer',
                            padding: '10px'
                        }}
                        onMouseEnter={(e) => e.target.style.color = '#ff4444'}
                        onMouseLeave={(e) => e.target.style.color = '#999'}
                    >
                        Delete Item
                    </span>
                </div>
            )}
        </div>
    );
};

export default ProductModal;
