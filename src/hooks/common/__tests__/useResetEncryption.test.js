import { renderHook } from '@testing-library/react';
import { useResetEncryption } from '../useResetEncryption';
import { vi } from 'vitest';

describe('useResetEncryption', () => {
  it('should clear localStorage and reload the page', () => {
    const removeItemSpy = vi.spyOn(Storage.prototype, 'removeItem');
    const reloadSpy = vi.fn();
    
    Object.defineProperty(window, 'location', {
        value: {
            reload: reloadSpy
        },
        writable: true
    });

    const { result } = renderHook(() => useResetEncryption());
    result.current.resetEncryptionAndStartFresh();

    expect(removeItemSpy).toHaveBeenCalledWith('envelopeBudgetData');
    expect(removeItemSpy).toHaveBeenCalledWith('userProfile');
    expect(removeItemSpy).toHaveBeenCalledWith('passwordLastChanged');
    expect(reloadSpy).toHaveBeenCalled();
  });
});